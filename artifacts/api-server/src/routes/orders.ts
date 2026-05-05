import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable, sellersTable } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
  GetOrderParams,
  ListOrdersQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function getOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return null;

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  return {
    ...order,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items,
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { role, status } = query.data;

  let whereClause;
  if (role === "seller") {
    whereClause = eq(ordersTable.sellerUserId, userId);
  } else if (role === "buyer") {
    whereClause = eq(ordersTable.buyerUserId, userId);
  } else {
    whereClause = or(eq(ordersTable.buyerUserId, userId), eq(ordersTable.sellerUserId, userId));
  }

  const orders = await db.select().from(ordersTable).where(whereClause).orderBy(ordersTable.createdAt);

  const ordersWithItems = await Promise.all(orders.map((o) => getOrderWithItems(o.id)));
  res.json(ordersWithItems.filter(Boolean));
});

router.post("/orders", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const cartItems = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      quantityGrams: cartItemsTable.quantityGrams,
      product: {
        name: productsTable.name,
        pricePerGram: productsTable.pricePerGram,
        stockGrams: productsTable.stockGrams,
        sellerId: productsTable.sellerId,
      },
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const sellerId = cartItems[0]?.product?.sellerId;
  if (!sellerId) {
    res.status(400).json({ error: "Invalid cart items" });
    return;
  }

  const [sellerRow] = await db.select().from(sellersTable).where(eq(sellersTable.id, sellerId));
  if (!sellerRow) {
    res.status(400).json({ error: "Seller not found" });
    return;
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (item.quantityGrams * (item.product?.pricePerGram ?? 0));
  }, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      buyerUserId: userId,
      sellerUserId: sellerRow.userId,
      totalAmount,
      shippingAddress: parsed.data.shippingAddress ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();

  const orderItems = cartItems.map((item) => ({
    orderId: order.id,
    productId: item.productId,
    productName: item.product?.name ?? "Unknown",
    quantityGrams: item.quantityGrams,
    pricePerGram: item.product?.pricePerGram ?? 0,
    subtotal: item.quantityGrams * (item.product?.pricePerGram ?? 0),
  }));

  await db.insert(orderItemsTable).values(orderItems);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  const fullOrder = await getOrderWithItems(order.id);
  res.status(201).json(fullOrder);
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const order = await getOrderWithItems(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (order.buyerUserId !== userId && order.sellerUserId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(order);
});

router.patch("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (existing.buyerUserId !== userId && existing.sellerUserId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const terminalStatuses = ["delivered", "cancelled"] as const;
  if (terminalStatuses.includes(existing.status as (typeof terminalStatuses)[number])) {
    res.status(400).json({ error: "This order cannot be changed anymore." });
    return;
  }

  const nextStatus = parsed.data.status;
  if (nextStatus === existing.status) {
    const unchanged = await getOrderWithItems(params.data.id);
    res.json(unchanged);
    return;
  }

  const isBuyer = existing.buyerUserId === userId;
  const isSeller = existing.sellerUserId === userId;

  if (nextStatus === "cancelled") {
    const buyerMayCancel = isBuyer && (existing.status === "pending" || existing.status === "confirmed");
    const sellerMayCancel =
      isSeller &&
      (existing.status === "pending" ||
        existing.status === "confirmed" ||
        existing.status === "processing" ||
        existing.status === "shipped");
    if (!buyerMayCancel && !sellerMayCancel) {
      res.status(403).json({
        error: "This order cannot be cancelled at its current stage.",
      });
      return;
    }
  } else if (!isSeller) {
    res.status(403).json({ error: "Only the seller can update fulfillment status." });
    return;
  }

  await db
    .update(ordersTable)
    .set({ status: nextStatus as (typeof existing.status) })
    .where(eq(ordersTable.id, params.data.id));

  const order = await getOrderWithItems(params.data.id);
  res.json(order);
});

export default router;

import { Router, type IRouter } from "express";
import { eq, or, sql, desc, and } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable, sellersTable, cartItemsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const buyerOrders = await db.select().from(ordersTable).where(eq(ordersTable.buyerUserId, userId));
  const totalOrders = buyerOrders.length;
  const pendingOrders = buyerOrders.filter((o) => ["pending", "confirmed", "processing"].includes(o.status)).length;
  const totalSpent = buyerOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const [sellerRow] = await db.select().from(sellersTable).where(eq(sellersTable.userId, userId));

  res.json({
    totalOrders,
    pendingOrders,
    totalSpent,
    favoriteCategory: null,
    isSeller: !!sellerRow,
  });
});

router.get("/dashboard/seller-stats", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const [seller] = await db.select().from(sellersTable).where(eq(sellersTable.userId, userId));
  if (!seller) {
    res.status(404).json({ error: "No seller profile found" });
    return;
  }

  const sellerOrders = await db.select().from(ordersTable).where(eq(ordersTable.sellerUserId, userId));
  const totalRevenue = sellerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersFulfilled = sellerOrders.filter((o) => o.status === "delivered").length;

  const activeListings = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(and(eq(productsTable.sellerId, seller.id), eq(productsTable.isAvailable, true)));
  const activeListingsCount = activeListings[0]?.count ?? 0;

  const topProducts = await db
    .select({
      id: productsTable.id,
      sellerId: productsTable.sellerId,
      sellerName: sellersTable.displayName,
      name: productsTable.name,
      description: productsTable.description,
      category: productsTable.category,
      pricePerGram: productsTable.pricePerGram,
      weightGrams: productsTable.weightGrams,
      stockGrams: productsTable.stockGrams,
      origin: productsTable.origin,
      season: productsTable.season,
      harvestDate: productsTable.harvestDate,
      imageUrl: productsTable.imageUrl,
      isFeatured: productsTable.isFeatured,
      isAvailable: productsTable.isAvailable,
      createdAt: productsTable.createdAt,
      updatedAt: productsTable.updatedAt,
    })
    .from(productsTable)
    .leftJoin(sellersTable, eq(productsTable.sellerId, sellersTable.id))
    .where(eq(productsTable.sellerId, seller.id))
    .orderBy(desc(productsTable.createdAt))
    .limit(3);

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.sellerUserId, userId))
    .orderBy(desc(ordersTable.createdAt))
    .limit(5);

  const recentOrdersWithItems = await Promise.all(
    recentOrders.map(async (o) => {
      const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
      return {
        ...o,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        items,
      };
    })
  );

  const now = new Date();
  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthStr = d.toLocaleString("default", { month: "short", year: "numeric" });
    const monthOrders = sellerOrders.filter((o) => {
      const od = new Date(o.createdAt);
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
    });
    return { month: monthStr, revenue: monthOrders.reduce((sum, o) => sum + o.totalAmount, 0) };
  });

  res.json({
    totalRevenue,
    totalOrdersFulfilled,
    activeListings: activeListingsCount,
    topProducts: topProducts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })),
    recentOrders: recentOrdersWithItems,
    revenueByMonth,
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const orders = await db
    .select()
    .from(ordersTable)
    .where(or(eq(ordersTable.buyerUserId, userId), eq(ordersTable.sellerUserId, userId)))
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  const activity = orders.map((o) => ({
    id: `order-${o.id}-${o.status}`,
    type: o.buyerUserId === userId ? "order_placed" : "order_status_update",
    message: o.buyerUserId === userId
      ? `You placed order #${o.id}`
      : `Order #${o.id} is ${o.status}`,
    timestamp: o.createdAt.toISOString(),
    orderId: o.id,
    productId: null,
  }));

  res.json(activity);
});

export default router;

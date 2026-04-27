import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable, productsTable, sellersTable } from "@workspace/db";
import {
  AddToCartBody,
  UpdateCartItemBody,
  UpdateCartItemParams,
  RemoveFromCartParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function getCartWithProducts(userId: string) {
  const items = await db
    .select({
      id: cartItemsTable.id,
      userId: cartItemsTable.userId,
      productId: cartItemsTable.productId,
      quantityGrams: cartItemsTable.quantityGrams,
      createdAt: cartItemsTable.createdAt,
      product: {
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
      },
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(sellersTable, eq(productsTable.sellerId, sellersTable.id))
    .where(eq(cartItemsTable.userId, userId));

  return items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    product: item.product
      ? {
          ...item.product,
          createdAt: item.product.createdAt!.toISOString(),
          updatedAt: item.product.updatedAt!.toISOString(),
        }
      : null,
  }));
}

router.get("/cart", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const items = await getCartWithProducts(userId);
  res.json(items);
});

router.post("/cart", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, parsed.data.productId)));

  let cartItemId: number;
  if (existing) {
    const [updated] = await db
      .update(cartItemsTable)
      .set({ quantityGrams: existing.quantityGrams + parsed.data.quantityGrams })
      .where(eq(cartItemsTable.id, existing.id))
      .returning();
    cartItemId = updated.id;
  } else {
    const [inserted] = await db
      .insert(cartItemsTable)
      .values({ userId, ...parsed.data })
      .returning();
    cartItemId = inserted.id;
  }

  const [item] = await getCartWithProducts(userId).then((items) => items.filter((i) => i.id === cartItemId));
  res.status(201).json(item);
});

router.patch("/cart/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.id, params.data.id), eq(cartItemsTable.userId, userId)));

  if (!existing) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  await db
    .update(cartItemsTable)
    .set({ quantityGrams: parsed.data.quantityGrams })
    .where(eq(cartItemsTable.id, params.data.id));

  const [item] = await getCartWithProducts(userId).then((items) => items.filter((i) => i.id === params.data.id));
  res.json(item);
});

router.delete("/cart/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = RemoveFromCartParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.id, params.data.id), eq(cartItemsTable.userId, userId)))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  res.sendStatus(204);
});

router.delete("/cart", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  res.sendStatus(204);
});

export default router;

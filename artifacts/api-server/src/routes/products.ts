import { Router, type IRouter } from "express";
import { eq, and, gte, lte, ilike, sql } from "drizzle-orm";
import { db, productsTable, sellersTable } from "@workspace/db";
import {
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  ListProductsQueryParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { category, sellerId, minPrice, maxPrice, inStock, search } = query.data;

  const conditions = [eq(productsTable.isAvailable, true)];
  if (category) conditions.push(eq(productsTable.category, category));
  if (sellerId) conditions.push(eq(productsTable.sellerId, Number(sellerId)));
  if (minPrice != null) conditions.push(gte(productsTable.pricePerGram, minPrice));
  if (maxPrice != null) conditions.push(lte(productsTable.pricePerGram, maxPrice));
  if (inStock != null && inStock) conditions.push(gte(productsTable.stockGrams, 0.1));
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

  const products = await db
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.createdAt);

  res.json(products.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
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
    .where(and(eq(productsTable.isFeatured, true), eq(productsTable.isAvailable, true)))
    .limit(6);

  res.json(products.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })));
});

router.get("/products/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select({
      category: productsTable.category,
      count: sql<number>`count(*)::int`,
      avgPricePerGram: sql<number>`avg(${productsTable.pricePerGram})`,
    })
    .from(productsTable)
    .where(eq(productsTable.isAvailable, true))
    .groupBy(productsTable.category)
    .orderBy(productsTable.category);

  res.json(categories);
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
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
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({ ...product, createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString() });
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const [seller] = await db.select().from(sellersTable).where(eq(sellersTable.userId, userId));
  if (!seller) {
    res.status(403).json({ error: "You must create a seller profile first" });
    return;
  }

  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .insert(productsTable)
    .values({ ...parsed.data, sellerId: seller.id })
    .returning();

  res.status(201).json({ ...product, sellerName: seller.displayName, createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString() });
});

router.patch("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [seller] = await db.select().from(sellersTable).where(eq(sellersTable.userId, userId));
  if (!seller) {
    res.status(403).json({ error: "Not a seller" });
    return;
  }

  const [existing] = await db.select().from(productsTable).where(and(eq(productsTable.id, params.data.id), eq(productsTable.sellerId, seller.id)));
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .update(productsTable)
    .set(parsed.data)
    .where(eq(productsTable.id, params.data.id))
    .returning();

  res.json({ ...product, sellerName: seller.displayName, createdAt: product.createdAt.toISOString(), updatedAt: product.updatedAt.toISOString() });
});

router.delete("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [seller] = await db.select().from(sellersTable).where(eq(sellersTable.userId, userId));
  if (!seller) {
    res.status(403).json({ error: "Not a seller" });
    return;
  }

  const [product] = await db
    .delete(productsTable)
    .where(and(eq(productsTable.id, params.data.id), eq(productsTable.sellerId, seller.id)))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

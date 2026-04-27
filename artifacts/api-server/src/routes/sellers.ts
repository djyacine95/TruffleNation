import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sellersTable } from "@workspace/db";
import {
  CreateSellerProfileBody,
  UpdateSellerProfileBody,
  GetSellerByIdParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/sellers", async (_req, res): Promise<void> => {
  const sellers = await db.select().from(sellersTable).orderBy(sellersTable.createdAt);
  res.json(sellers.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })));
});

router.get("/sellers/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;
  const [seller] = await db.select().from(sellersTable).where(eq(sellersTable.userId, userId));
  if (!seller) {
    res.status(404).json({ error: "No seller profile found" });
    return;
  }
  res.json({ ...seller, createdAt: seller.createdAt.toISOString() });
});

router.post("/sellers/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const [existing] = await db.select().from(sellersTable).where(eq(sellersTable.userId, userId));
  if (existing) {
    res.status(409).json({ error: "Seller profile already exists" });
    return;
  }

  const parsed = CreateSellerProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [seller] = await db
    .insert(sellersTable)
    .values({ ...parsed.data, userId })
    .returning();

  res.status(201).json({ ...seller, createdAt: seller.createdAt.toISOString() });
});

router.patch("/sellers/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as any).userId as string;

  const parsed = UpdateSellerProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [seller] = await db
    .update(sellersTable)
    .set(parsed.data)
    .where(eq(sellersTable.userId, userId))
    .returning();

  if (!seller) {
    res.status(404).json({ error: "Seller profile not found" });
    return;
  }

  res.json({ ...seller, createdAt: seller.createdAt.toISOString() });
});

router.get("/sellers/:id", async (req, res): Promise<void> => {
  const params = GetSellerByIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [seller] = await db.select().from(sellersTable).where(eq(sellersTable.id, params.data.id));
  if (!seller) {
    res.status(404).json({ error: "Seller not found" });
    return;
  }

  res.json({ ...seller, createdAt: seller.createdAt.toISOString() });
});

export default router;

import { pgTable, text, serial, timestamp, boolean, real, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sellerTypeEnum = pgEnum("seller_type", [
  "forager",
  "commercial_supplier",
  "restaurant",
  "individual",
]);

export const sellersTable = pgTable("sellers", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  location: text("location"),
  sellerType: sellerTypeEnum("seller_type").notNull().default("individual"),
  imageUrl: text("image_url"),
  isVerified: boolean("is_verified").notNull().default(false),
  rating: real("rating"),
  totalSales: integer("total_sales").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSellerSchema = createInsertSchema(sellersTable).omit({
  id: true,
  totalSales: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type Seller = typeof sellersTable.$inferSelect;

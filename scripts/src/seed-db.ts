/**
 * Seeds demo sellers + truffle listings. Run from repo root:
 *   npm run db:seed
 * Requires DATABASE_URL in TruffleNation/.env and schema applied (`npm run db:push`).
 */
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
config({ path: path.join(repoRoot, ".env") });

const { db, sellersTable, productsTable, pool } = await import("@workspace/db");

const SEED_TAG = "seed_trufflenation";
const DEMO_IMAGE_BY_NAME: Record<string, string | null> = {
  "Périgord Black Winter (T. melanosporum)": "/images/truffles/perigord-black-winter.jpg",
  "Alba White (T. magnatum)": "/images/truffles/alba-white-magnatum.jpg",
  "Istrian Black Summer (Scorzone)": "/images/truffles/istrian-black-summer.jpg",
  "Burgundy (T. uncinatum)": "/images/truffles/burgundy-uncinatum.jpg",
  "Oregon Black Winter": "/images/truffles/oregon-black-winter.jpg",
  "Oregon White Spring": "/images/truffles/oregon-white-spring.jpg",
  "Bianchetto (T. borchii)": "/images/truffles/bianchetto.jpg",
  "Australian Black Winter": "/images/truffles/australian-black-winter.jpg",
  "Spanish Black Winter (Teruel)": "/images/truffles/spanish-black-teruel.jpg",
  "Romanian Mixed Forest Black": "/images/truffles/romanian-mixed-forest-black.jpg",
  "Tasmanian Black Winter": "/images/truffles/tasmanian-black-winter.jpg",
  "Hungarian Summer Black": "/images/truffles/hungarian-summer-black.jpg",
};

async function main() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable);

  if (count > 0) {
    for (const [name, imageUrl] of Object.entries(DEMO_IMAGE_BY_NAME)) {
      await db
        .update(productsTable)
        .set({ imageUrl: imageUrl ?? null })
        .where(eq(productsTable.name, name));
    }
    console.log(`Database already has ${count} product(s). Updated image URLs to local truffle photos.`);
    await pool.end();
    return;
  }

  const [sellerA] = await db
    .insert(sellersTable)
    .values({
      userId: `${SEED_TAG}_seller_a`,
      displayName: "Terre & Truffe Collective",
      bio: "Demo supplier — Piedmont and Dordogne seasonal lots for local development.",
      location: "Alba, Italy",
      sellerType: "commercial_supplier",
      isVerified: true,
      rating: 4.9,
    })
    .returning({ id: sellersTable.id });

  const [sellerB] = await db
    .insert(sellersTable)
    .values({
      userId: `${SEED_TAG}_seller_b`,
      displayName: "Willamette Forest Goods",
      bio: "Demo Pacific Northwest orchard and wild-foraged lines.",
      location: "Oregon, USA",
      sellerType: "forager",
      isVerified: true,
      rating: 4.7,
    })
    .returning({ id: sellersTable.id });

  if (!sellerA || !sellerB) {
    throw new Error("Failed to insert seed sellers");
  }

  const rows = [
    {
      sellerId: sellerA.id,
      name: "Périgord Black Winter (T. melanosporum)",
      description: "Classic chocolate-garlic depth; firm texture. Ideal for risotto and compound butter.",
      category: "Black Winter",
      pricePerGram: 4.25,
      weightGrams: 80,
      stockGrams: 480,
      origin: "Dordogne, France",
      season: "Dec–Mar",
      imageUrl: DEMO_IMAGE_BY_NAME["Périgord Black Winter (T. melanosporum)"] ?? null,
      isFeatured: true,
      isAvailable: true,
    },
    {
      sellerId: sellerA.id,
      name: "Alba White (T. magnatum)",
      description: "Peak-season white; shave raw over eggs, pasta, or fonduta.",
      category: "White Alba",
      pricePerGram: 18.5,
      weightGrams: 40,
      stockGrams: 120,
      origin: "Langhe, Italy",
      season: "Oct–Dec",
      imageUrl: DEMO_IMAGE_BY_NAME["Alba White (T. magnatum)"] ?? null,
      isFeatured: true,
      isAvailable: true,
    },
    {
      sellerId: sellerA.id,
      name: "Istrian Black Summer (Scorzone)",
      description: "Milder hazelnut notes; forgiving with gentle heat and oils.",
      category: "Summer Truffle",
      pricePerGram: 1.85,
      weightGrams: 120,
      stockGrams: 900,
      origin: "Istria, Croatia",
      season: "May–Aug",
      imageUrl: DEMO_IMAGE_BY_NAME["Istrian Black Summer (Scorzone)"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
    {
      sellerId: sellerA.id,
      name: "Burgundy (T. uncinatum)",
      description: "Forest-floor and hazelnut aroma; bridges summer and winter menus.",
      category: "Burgundy",
      pricePerGram: 2.4,
      weightGrams: 60,
      stockGrams: 360,
      origin: "Vaucluse, France",
      season: "Sep–Nov",
      imageUrl: DEMO_IMAGE_BY_NAME["Burgundy (T. uncinatum)"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
    {
      sellerId: sellerB.id,
      name: "Oregon Black Winter",
      description: "Pacific Northwest melanosporum-style; chocolate and earth, chef-tested.",
      category: "Black Winter",
      pricePerGram: 3.1,
      weightGrams: 100,
      stockGrams: 550,
      origin: "Willamette Valley, USA",
      season: "Dec–Feb",
      imageUrl: DEMO_IMAGE_BY_NAME["Oregon Black Winter"] ?? null,
      isFeatured: true,
      isAvailable: true,
    },
    {
      sellerId: sellerB.id,
      name: "Oregon White Spring",
      description: "Counter-seasonal white-adjacent aroma; lighter than Alba, excellent on pizza bianca.",
      category: "White Alba",
      pricePerGram: 6.75,
      weightGrams: 50,
      stockGrams: 200,
      origin: "Yamhill County, USA",
      season: "Mar–May",
      imageUrl: DEMO_IMAGE_BY_NAME["Oregon White Spring"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
    {
      sellerId: sellerB.id,
      name: "Bianchetto (T. borchii)",
      description: "Garlic-forward Italian white; great value for pasta and eggs.",
      category: "Bianchetto",
      pricePerGram: 2.95,
      weightGrams: 45,
      stockGrams: 280,
      origin: "Tuscany, Italy",
      season: "Jan–Apr",
      imageUrl: DEMO_IMAGE_BY_NAME["Bianchetto (T. borchii)"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
    {
      sellerId: sellerA.id,
      name: "Australian Black Winter",
      description: "Southern-hemisphere harvest; mirrors European winter windows.",
      category: "Black Winter",
      pricePerGram: 2.65,
      weightGrams: 90,
      stockGrams: 640,
      origin: "Manjimup, Australia",
      season: "Jun–Aug",
      imageUrl: DEMO_IMAGE_BY_NAME["Australian Black Winter"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
    {
      sellerId: sellerB.id,
      name: "Spanish Black Winter (Teruel)",
      description: "Orchard-grown Aragón lot; consistent sizing for service.",
      category: "Black Winter",
      pricePerGram: 2.2,
      weightGrams: 110,
      stockGrams: 880,
      origin: "Teruel, Spain",
      season: "Dec–Mar",
      imageUrl: DEMO_IMAGE_BY_NAME["Spanish Black Winter (Teruel)"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
    {
      sellerId: sellerA.id,
      name: "Romanian Mixed Forest Black",
      description: "Wild-harvested lots; variable shape, strong aroma when ripe.",
      category: "Black Winter",
      pricePerGram: 1.95,
      weightGrams: 70,
      stockGrams: 420,
      origin: "Transylvania, Romania",
      season: "Nov–Feb",
      imageUrl: DEMO_IMAGE_BY_NAME["Romanian Mixed Forest Black"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
    {
      sellerId: sellerB.id,
      name: "Tasmanian Black Winter",
      description: "Counter-seasonal Southern supply; firm and aromatic.",
      category: "Black Winter",
      pricePerGram: 2.9,
      weightGrams: 85,
      stockGrams: 340,
      origin: "Tasmania, Australia",
      season: "Jun–Aug",
      imageUrl: DEMO_IMAGE_BY_NAME["Tasmanian Black Winter"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
    {
      sellerId: sellerA.id,
      name: "Hungarian Summer Black",
      description: "Scorzone-style; nutty and approachable for infusions.",
      category: "Summer Truffle",
      pricePerGram: 1.55,
      weightGrams: 100,
      stockGrams: 720,
      origin: "Northern Hungary",
      season: "Jun–Aug",
      imageUrl: DEMO_IMAGE_BY_NAME["Hungarian Summer Black"] ?? null,
      isFeatured: false,
      isAvailable: true,
    },
  ] as const;

  await db.insert(productsTable).values(rows.map((r) => ({ ...r, harvestDate: "2025–2026 season" })));

  console.log(`Seeded ${rows.length} products for sellers ${sellerA.id}, ${sellerB.id}.`);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => {});
  process.exit(1);
});

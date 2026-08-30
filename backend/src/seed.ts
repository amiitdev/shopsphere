import mongoose from "mongoose";
import { config } from "./config";
import { ProductModel } from "./models/Product";
import { UserModel } from "./models/User";
import { imageUrl } from "./app";
import bcrypt from "bcryptjs";

interface SeedProduct {
  sourceId: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

const products: SeedProduct[] = [
  {
    sourceId: 1,
    title: "Midnight Pro Wireless Headphones",
    price: 189.99,
    description: "Premium wireless headphones with active noise cancellation and 30-hour battery life. Features memory foam ear cushions for all-day comfort.",
    category: "electronics",
    image: imageUrl("01-headphones.png"),
    rating: { rate: 4.7, count: 312 },
  },
  {
    sourceId: 2,
    title: "Minimalist Rose Gold Watch",
    price: 249,
    description: "Elegant rose gold watch with Japanese quartz movement and sapphire crystal glass. Water-resistant to 50 meters.",
    category: "jewelry",
    image: imageUrl("02-watch.png"),
    rating: { rate: 4.8, count: 205 },
  },
  {
    sourceId: 3,
    title: "Ceramic Pour-Over Coffee Set",
    price: 64.5,
    description: "Handcrafted ceramic pour-over dripper with matching carafe and two mugs. Makes rich, aromatic coffee every time.",
    category: "home",
    image: imageUrl("03-coffee-set.png"),
    rating: { rate: 4.6, count: 178 },
  },
  {
    sourceId: 4,
    title: "Merino Wool Crew Neck",
    price: 89,
    description: "Ultra-soft 100% merino wool crew neck sweater. Naturally temperature-regulating and moisture-wicking for year-round wear.",
    category: "clothing",
    image: imageUrl("04-sweater.png"),
    rating: { rate: 4.5, count: 234 },
  },
  {
    sourceId: 5,
    title: "Brushed Gold Pendant Necklace",
    price: 145,
    description: "Delicate brushed gold pendant on a fine chain. Hypoallergenic and tarnish-resistant for everyday elegance.",
    category: "jewelry",
    image: imageUrl("05-necklace.png"),
    rating: { rate: 4.9, count: 156 },
  },
  {
    sourceId: 6,
    title: "Organic Cotton Throw Blanket",
    price: 79.99,
    description: "Luxuriously soft organic cotton throw with herringbone weave. Perfect for cozy evenings on the couch.",
    category: "home",
    image: imageUrl("06-blanket.png"),
    rating: { rate: 4.7, count: 289 },
  },
  {
    sourceId: 7,
    title: "Titanium Data Key 256GB",
    price: 34.99,
    description: "Rugged titanium USB-C flash drive with 256GB capacity. Splash-proof and reads up to 400MB/s.",
    category: "electronics",
    image: imageUrl("07-usb.png"),
    rating: { rate: 4.4, count: 412 },
  },
  {
    sourceId: 8,
    title: "Hand-Blown Glass Vase",
    price: 52,
    description: "Unique hand-blown borosilicate glass vase with organic curves. Each piece is one-of-a-kind.",
    category: "home",
    image: imageUrl("08-vase.png"),
    rating: { rate: 4.8, count: 134 },
  },
  {
    sourceId: 9,
    title: "Silk Sleep Mask",
    price: 28,
    description: "Pure mulberry silk sleep mask with adjustable elastic strap. Blocks light completely for uninterrupted rest.",
    category: "accessories",
    image: imageUrl("09-sleepmask.png"),
    rating: { rate: 4.6, count: 523 },
  },
  {
    sourceId: 10,
    title: "Smart Home Hub Mini",
    price: 129,
    description: "Compact smart home hub that connects and controls all your devices. Built-in speaker with voice assistant support.",
    category: "electronics",
    image: imageUrl("10-speaker.png"),
    rating: { rate: 4.3, count: 367 },
  },
  {
    sourceId: 11,
    title: "Italian Leather Messenger Bag",
    price: 198,
    description: "Full-grain Italian leather messenger bag with brass hardware. Ages beautifully with a rich patina over time.",
    category: "accessories",
    image: imageUrl("11-bag.png"),
    rating: { rate: 4.9, count: 189 },
  },
  {
    sourceId: 12,
    title: "Bamboo Wireless Charging Pad",
    price: 39.99,
    description: "Eco-friendly bamboo wireless charger with 15W fast charging. Compatible with all Qi-enabled devices.",
    category: "electronics",
    image: imageUrl("12-charger.png"),
    rating: { rate: 4.5, count: 298 },
  },
  {
    sourceId: 13,
    title: "Cashmere Beanie",
    price: 65,
    description: "Lightweight 100% cashmere beanie that keeps you warm without overheating. Available in multiple colors.",
    category: "clothing",
    image: imageUrl("13-beanie.png"),
    rating: { rate: 4.7, count: 201 },
  },
  {
    sourceId: 14,
    title: "Artisan Olive Wood Cutting Board",
    price: 74,
    description: "Hand-carved olive wood cutting board with natural grain patterns. Naturally antimicrobial and knife-friendly.",
    category: "home",
    image: imageUrl("14-cuttingboard.png"),
    rating: { rate: 4.8, count: 167 },
  },
  {
    sourceId: 15,
    title: "Sterling Silver Cuff",
    price: 120,
    description: "Handcrafted sterling silver cuff bracelet with hammered finish. Adjustable for a comfortable fit.",
    category: "jewelry",
    image: imageUrl("15-cuff.png"),
    rating: { rate: 4.6, count: 143 },
  },
  {
    sourceId: 16,
    title: "Precision Pour Gooseneck Kettle",
    price: 85,
    description: "Temperature-controlled gooseneck kettle with precision pour spout. Ideal for pour-over coffee and tea.",
    category: "home",
    image: imageUrl("16-kettle.png"),
    rating: { rate: 4.7, count: 256 },
  },
  {
    sourceId: 17,
    title: "Recycled Denim Jacket",
    price: 110,
    description: "Sustainably made jacket from 100% recycled denim. Classic trucker style with a modern relaxed fit.",
    category: "clothing",
    image: imageUrl("17-denim.png"),
    rating: { rate: 4.5, count: 178 },
  },
  {
    sourceId: 18,
    title: "Handmade Soy Candle Set",
    price: 42,
    description: "Set of three hand-poured soy candles in cedar, lavender, and vanilla. Burns clean for up to 40 hours each.",
    category: "home",
    image: imageUrl("18-candles.png"),
    rating: { rate: 4.8, count: 345 },
  },
  {
    sourceId: 19,
    title: "Polished Marble Desk Organizer",
    price: 58,
    description: "Sleek polished marble desk organizer with compartments for pens, cards, and small accessories.",
    category: "home",
    image: imageUrl("19-marble.png"),
    rating: { rate: 4.6, count: 112 },
  },
  {
    sourceId: 20,
    title: "Ultralight Down Vest",
    price: 168,
    description: "Packable 800-fill down vest weighing under 200g. Water-resistant shell with zippered pockets.",
    category: "clothing",
    image: imageUrl("20-vest.png"),
    rating: { rate: 4.7, count: 234 },
  },
];

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log("Connected to MongoDB");

  const ops = products.map((p) => ({
    updateOne: {
      filter: { sourceId: p.sourceId },
      update: { $set: p },
      upsert: true,
    },
  }));
  const result = await ProductModel.bulkWrite(ops);
  console.log(
    `Seed: ${result.upsertedCount} new, ${result.modifiedCount} updated (of ${products.length} seed products)`
  );

  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@shopsphere.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const existingAdmin = await UserModel.findOne({ email: adminEmail }).exec();
  if (existingAdmin) {
    await UserModel.updateOne({ _id: existingAdmin._id }, { role: "admin" });
    console.log(`Admin already exists, ensured role=admin (${adminEmail})`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await UserModel.create({
      name: "ShopSphere Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
    });
    console.log(`Created admin user (${adminEmail})`);
  }

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

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
  {
    sourceId: 21,
    title: "True Wireless Earbuds",
    price: 79.99,
    description: "Compact matte black earbuds with active noise cancellation and 8-hour battery life. IPX5 water resistant.",
    category: "electronics",
    image: imageUrl("21-earbuds.png"),
    rating: { rate: 4.6, count: 342 },
  },
  {
    sourceId: 22,
    title: "Portable Bluetooth Speaker",
    price: 59.99,
    description: "Cylindrical teal speaker with rich 360-degree sound. 12-hour battery and IP67 dust and water resistance.",
    category: "electronics",
    image: imageUrl("22-speaker.png"),
    rating: { rate: 4.5, count: 278 },
  },
  {
    sourceId: 23,
    title: "Smart Fitness Tracker",
    price: 99,
    description: "Slim fitness band with continuous heart rate monitoring, sleep tracking, and 7-day battery life.",
    category: "electronics",
    image: imageUrl("23-tracker.png"),
    rating: { rate: 4.4, count: 456 },
  },
  {
    sourceId: 24,
    title: "7-in-1 USB-C Hub Adapter",
    price: 49.99,
    description: "Brushed aluminum hub with HDMI, USB-A x3, SD card, microSD, and 100W power delivery passthrough.",
    category: "electronics",
    image: imageUrl("24-usbc-hub.png"),
    rating: { rate: 4.7, count: 189 },
  },
  {
    sourceId: 25,
    title: "Adjustable LED Desk Lamp",
    price: 69,
    description: "Minimalist LED desk lamp with 5 brightness levels and 3 color temperatures. Touch-sensitive controls.",
    category: "home",
    image: imageUrl("25-desklamp.png"),
    rating: { rate: 4.6, count: 212 },
  },
  {
    sourceId: 26,
    title: "Sapphire Stud Earrings",
    price: 135,
    description: "Sterling silver stud earrings with genuine blue sapphires. Hypoallergenic posts with butterfly backs.",
    category: "jewelry",
    image: imageUrl("26-earrings.png"),
    rating: { rate: 4.8, count: 167 },
  },
  {
    sourceId: 27,
    title: "Gold-Plated Link Bracelet",
    price: 89,
    description: "18K gold-plated chain link bracelet with secure clasp. Tarnish-resistant and hypoallergenic.",
    category: "jewelry",
    image: imageUrl("27-bracelet.png"),
    rating: { rate: 4.5, count: 198 },
  },
  {
    sourceId: 28,
    title: "Freshwater Pearl Necklace",
    price: 155,
    description: "Elegant freshwater pearl drop pendant on a fine sterling silver chain. Each pearl hand-selected for luster.",
    category: "jewelry",
    image: imageUrl("28-pearlnecklace.png"),
    rating: { rate: 4.9, count: 145 },
  },
  {
    sourceId: 29,
    title: "Ceramic Herb Planter Set",
    price: 44,
    description: "Set of three white ceramic planters on a bamboo drainage tray. Perfect for windowsill herbs.",
    category: "home",
    image: imageUrl("29-herbplanter.png"),
    rating: { rate: 4.6, count: 234 },
  },
  {
    sourceId: 30,
    title: "Stoneware Bowl Set",
    price: 56,
    description: "Set of four nesting stoneware bowls in neutral earth tones. Microwave and dishwasher safe.",
    category: "home",
    image: imageUrl("30-bowls.png"),
    rating: { rate: 4.7, count: 187 },
  },
  {
    sourceId: 31,
    title: "Ultrasonic Aromatherapy Diffuser",
    price: 48,
    description: "Wood grain finish diffuser with color-changing LED mood light. Runs up to 10 hours on continuous mist.",
    category: "home",
    image: imageUrl("31-diffuser.png"),
    rating: { rate: 4.5, count: 312 },
  },
  {
    sourceId: 32,
    title: "Cork Wall Organizer",
    price: 39,
    description: "Natural cork pin board with a small wooden shelf for notes, photos, and small accessories.",
    category: "home",
    image: imageUrl("32-corkboard.png"),
    rating: { rate: 4.4, count: 156 },
  },
  {
    sourceId: 33,
    title: "Linen Napkin Set",
    price: 32,
    description: "Set of four stone-washed linen napkins in earth tones. Softens with each wash.",
    category: "home",
    image: imageUrl("33-napkins.png"),
    rating: { rate: 4.6, count: 198 },
  },
  {
    sourceId: 34,
    title: "Enameled Cast Iron Dutch Oven",
    price: 129,
    description: "6-quart enameled cast iron dutch oven in deep red. Even heat distribution for braising and stewing.",
    category: "home",
    image: imageUrl("34-dutchoven.png"),
    rating: { rate: 4.8, count: 267 },
  },
  {
    sourceId: 35,
    title: "Casual Linen Shirt",
    price: 78,
    description: "Relaxed-fit short-sleeve linen shirt in light blue. Breathable fabric perfect for warm weather.",
    category: "clothing",
    image: imageUrl("35-linenshirt.png"),
    rating: { rate: 4.5, count: 189 },
  },
  {
    sourceId: 36,
    title: "Herringbone Wool Scarf",
    price: 54,
    description: "Soft grey herringbone wool scarf with fringe edges. Warm yet lightweight for layering.",
    category: "clothing",
    image: imageUrl("36-scarf.png"),
    rating: { rate: 4.7, count: 223 },
  },
  {
    sourceId: 37,
    title: "Reversible Quilted Vest",
    price: 95,
    description: "Reversible quilted vest in earth tones. Water-resistant shell on one side, soft fleece on the other.",
    category: "clothing",
    image: imageUrl("37-vest.png"),
    rating: { rate: 4.6, count: 178 },
  },
  {
    sourceId: 38,
    title: "Cushioned Running Socks",
    price: 24,
    description: "Three-pack of moisture-wicking running socks with arch support and reinforced heel and toe.",
    category: "clothing",
    image: imageUrl("38-socks.png"),
    rating: { rate: 4.5, count: 412 },
  },
  {
    sourceId: 39,
    title: "RFID Leather Card Wallet",
    price: 42,
    description: "Slim full-grain leather card wallet with RFID blocking. Holds 6 cards and has a cash pocket.",
    category: "accessories",
    image: imageUrl("39-wallet.png"),
    rating: { rate: 4.7, count: 256 },
  },
  {
    sourceId: 40,
    title: "Canvas Tote Bag",
    price: 36,
    description: "Minimalist natural canvas tote with reinforced leather handles. Interior zip pocket for essentials.",
    category: "accessories",
    image: imageUrl("40-tote.png"),
    rating: { rate: 4.6, count: 334 },
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

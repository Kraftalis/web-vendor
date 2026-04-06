// @ts-nocheck
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Show all columns on booking_links
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='booking_links' ORDER BY ordinal_position`,
    );
    console.log("=== COLUMNS ON booking_links ===");
    console.log(JSON.stringify(cols, null, 2));

    // 2. Try findMany
    console.log("\n=== findMany test ===");
    const rows = await prisma.bookingLink.findMany({ take: 1 });
    console.log("Success! Rows:", JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("ERROR:", err.name);
    console.error("Message:", err.message);
    console.error("Meta:", JSON.stringify(err.meta, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();

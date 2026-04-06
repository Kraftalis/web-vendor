// @ts-nocheck
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaPg({
  connectionString:
    "postgresql://postgres:WYuMC0takPrqa6aJ8ccN@46.250.237.113:6543/kraftalis",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='booking_links' ORDER BY ordinal_position`,
    );
    console.log("=== COLUMNS ON booking_links ===");
    for (const c of cols) {
      console.log(`  ${c.column_name} (${c.data_type})`);
    }

    console.log("\n=== findMany test ===");
    const rows = await prisma.bookingLink.findMany({ take: 1 });
    console.log("Success! Row count:", rows.length);
  } catch (err) {
    console.error("ERROR:", err.name);
    console.error("Message:", err.message);
    try {
      console.error("Meta:", JSON.stringify(err.meta, null, 2));
    } catch (_) {
      console.error("Meta (raw):", err.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

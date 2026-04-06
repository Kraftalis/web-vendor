/* Quick script to surface Prisma error meta for booking_links lookup */
const path = require("path");
const { PrismaClient } = require(
  path.resolve(__dirname, "../src/generated/prisma"),
);

(async () => {
  const prisma = new PrismaClient();
  try {
    console.log("Running bookingLink.findMany()...");
    const rows = await prisma.bookingLink.findMany({ take: 1 });
    console.log("Result:", JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("Prisma error thrown:");
    console.error(err && err.name);
    console.error(err && err.message);
    try {
      console.error("Error meta:", JSON.stringify(err && err.meta, null, 2));
    } catch (e) {
      console.error("Failed to stringify meta:", e);
    }
    console.error("Full error object:", err);
  } finally {
    await prisma.$disconnect();
  }
})();

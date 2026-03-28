/**
 * Backfill script: Create FinanceTransaction records for verified payments
 * that don't already have a corresponding finance transaction.
 *
 * This fixes the bug where payments created through booking links (with isVerified=true)
 * were not being recorded as income transactions in the vendor's finance account.
 *
 * Usage:
 *   npx tsx -r tsconfig-paths/register scripts/backfill-payments-to-transactions.ts
 *   npx tsx -r tsconfig-paths/register scripts/backfill-payments-to-transactions.ts --dry-run
 */

import "dotenv/config";
import { prisma } from "@/lib/prisma";
import {
  findPrimaryAccount,
  createIncomeFromPayment,
} from "@/repositories/finance";

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  console.log(
    "🔍 Backfill: scanning verified payments without finance transactions...",
  );
  if (isDryRun) {
    console.log("   (DRY RUN — no data will be written)\n");
  }

  const payments = await prisma.payment.findMany({
    where: { isVerified: true },
    include: {
      event: {
        select: {
          id: true,
          businessProfileId: true,
          clientName: true,
          eventType: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`   Found ${payments.length} verified payments total.`);

  let created = 0;
  let skipped = 0;

  for (const p of payments) {
    try {
      if (!p.event?.businessProfileId) {
        skipped++;
        continue;
      }

      // Check if transaction already exists for this payment
      const suffix = p.id.slice(-8);
      const exists = await prisma.financeTransaction.findFirst({
        where: { eventId: p.eventId, notes: { contains: suffix } },
      });
      if (exists) continue;

      const primary = await findPrimaryAccount(p.event.businessProfileId);
      if (!primary) {
        console.log(
          `   ⏭️  Skipping payment ${p.id} — no primary finance account.`,
        );
        skipped++;
        continue;
      }

      const description = p.event.clientName
        ? `Payment from ${p.event.clientName}`
        : "Event payment";

      console.log(
        `   ${isDryRun ? "[DRY]" : "  💰"} ${description} — ` +
          `Rp ${Number(p.amount).toLocaleString("id-ID")} (${p.paymentType}) ` +
          `[Payment: ${suffix}]`,
      );

      if (!isDryRun) {
        await createIncomeFromPayment({
          businessProfileId: p.event.businessProfileId,
          primaryAccountId: primary.id,
          paymentId: p.id,
          amount: Number(p.amount),
          currency: p.currency ?? undefined,
          eventId: p.eventId,
          clientName: p.event.clientName,
          eventType: p.event.eventType,
          paymentType: p.paymentType,
          receiptUrl: p.receiptUrl ?? null,
          receiptName: p.receiptName ?? null,
        });
      }

      created++;
    } catch (err) {
      console.error(`   ❌ Failed for payment ${p.id}:`, err);
    }
  }

  console.log(
    `\n✅ Backfill complete: ${created} transactions ${isDryRun ? "would be " : ""}created, ${skipped} skipped.`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
  })
  .finally(() => process.exit(0));

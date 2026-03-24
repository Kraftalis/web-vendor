-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable: finance_accounts
CREATE TABLE "finance_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_profile_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "finance_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: finance_transactions
CREATE TABLE "finance_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_profile_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'IDR',
    "transaction_date" DATE NOT NULL,
    "receipt_url" TEXT,
    "receipt_name" VARCHAR(255),
    "event_id" UUID,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "finance_transactions_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "finance_accounts_business_profile_id_idx" ON "finance_accounts"("business_profile_id");
CREATE INDEX "finance_transactions_business_profile_id_idx" ON "finance_transactions"("business_profile_id");
CREATE INDEX "finance_transactions_account_id_idx" ON "finance_transactions"("account_id");
CREATE INDEX "finance_transactions_type_idx" ON "finance_transactions"("type");
CREATE INDEX "finance_transactions_transaction_date_idx" ON "finance_transactions"("transaction_date");
CREATE INDEX "finance_transactions_category_idx" ON "finance_transactions"("category");
CREATE INDEX "finance_transactions_event_id_idx" ON "finance_transactions"("event_id");

-- Foreign keys
ALTER TABLE "finance_accounts" ADD CONSTRAINT "finance_accounts_business_profile_id_fkey"
  FOREIGN KEY ("business_profile_id") REFERENCES "business_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_business_profile_id_fkey"
  FOREIGN KEY ("business_profile_id") REFERENCES "business_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "finance_accounts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "events"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

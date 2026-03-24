-- Add isPrimary flag to finance_accounts
ALTER TABLE "finance_accounts" ADD COLUMN "is_primary" BOOLEAN NOT NULL DEFAULT false;

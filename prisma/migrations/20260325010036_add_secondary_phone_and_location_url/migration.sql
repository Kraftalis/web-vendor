-- AlterTable
ALTER TABLE "booking_links" ADD COLUMN     "client_phone_secondary" VARCHAR(50),
ADD COLUMN     "event_location_url" TEXT;

-- AlterTable
ALTER TABLE "business_profiles" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "client_phone_secondary" VARCHAR(50),
ADD COLUMN     "event_location_url" TEXT;

-- AlterTable
ALTER TABLE "finance_accounts" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "finance_transactions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "push_subscriptions" ALTER COLUMN "id" DROP DEFAULT;

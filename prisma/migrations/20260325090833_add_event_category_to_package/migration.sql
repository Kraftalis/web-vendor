-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "event_category_id" UUID;

-- CreateIndex
CREATE INDEX "packages_event_category_id_idx" ON "packages"("event_category_id");

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_event_category_id_fkey" FOREIGN KEY ("event_category_id") REFERENCES "event_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

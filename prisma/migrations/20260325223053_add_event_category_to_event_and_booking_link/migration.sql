-- AlterTable
ALTER TABLE "booking_links" ADD COLUMN     "event_category_id" UUID;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "event_category_id" UUID;

-- CreateIndex
CREATE INDEX "events_event_category_id_idx" ON "events"("event_category_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_event_category_id_fkey" FOREIGN KEY ("event_category_id") REFERENCES "event_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

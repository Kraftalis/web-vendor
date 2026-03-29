-- AlterTable
ALTER TABLE "booking_links" ADD COLUMN     "schedule_dates" JSONB;

-- CreateTable
CREATE TABLE "event_schedules" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" VARCHAR(20),
    "end_time" VARCHAR(20),
    "label" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_schedules_event_id_idx" ON "event_schedules"("event_id");

-- CreateIndex
CREATE INDEX "event_schedules_date_idx" ON "event_schedules"("date");

-- AddForeignKey
ALTER TABLE "event_schedules" ADD CONSTRAINT "event_schedules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

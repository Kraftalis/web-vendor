/*
  Warnings:

  - You are about to drop the column `event_date` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `event_time` on the `events` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "events_event_date_idx";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "event_date",
DROP COLUMN "event_time";

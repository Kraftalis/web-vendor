-- CreateTable
CREATE TABLE "event_briefs" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "author_type" VARCHAR(10) NOT NULL,
    "author_name" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_briefs_event_id_idx" ON "event_briefs"("event_id");

-- CreateIndex
CREATE INDEX "event_briefs_created_at_idx" ON "event_briefs"("created_at");

-- AddForeignKey
ALTER TABLE "event_briefs" ADD CONSTRAINT "event_briefs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

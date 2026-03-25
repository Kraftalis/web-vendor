-- CreateTable
CREATE TABLE "event_categories" (
    "id" UUID NOT NULL,
    "business_profile_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_categories_business_profile_id_idx" ON "event_categories"("business_profile_id");

-- CreateIndex
CREATE INDEX "event_categories_sort_order_idx" ON "event_categories"("sort_order");

-- CreateIndex
CREATE INDEX "event_categories_is_active_idx" ON "event_categories"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "event_categories_business_profile_id_name_key" ON "event_categories"("business_profile_id", "name");

-- AddForeignKey
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_business_profile_id_fkey" FOREIGN KEY ("business_profile_id") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

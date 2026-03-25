-- Remove subcategory FK from packages
ALTER TABLE "packages" DROP CONSTRAINT IF EXISTS "packages_subcategory_id_fkey";
DROP INDEX IF EXISTS "packages_subcategory_id_idx";
ALTER TABLE "packages" DROP COLUMN IF EXISTS "subcategory_id";

-- Clear all package data (reset)
DELETE FROM "package_items";
DELETE FROM "packages";

-- Drop subcategories table
DROP TABLE IF EXISTS "subcategories";

-- Clear category data (reset)
DELETE FROM "categories";

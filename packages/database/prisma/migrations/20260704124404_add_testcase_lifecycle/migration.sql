-- CreateEnum
CREATE TYPE "public"."LifecycleState" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "public"."TestCase" ADD COLUMN     "lifecycle" "public"."LifecycleState" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "TestCase_lifecycle_idx" ON "public"."TestCase"("lifecycle");

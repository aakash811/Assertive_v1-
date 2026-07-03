/*
  Warnings:

  - You are about to drop the column `uniqueId` on the `TestCase` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."TestCase_projectId_uniqueId_idx";

-- DropIndex
DROP INDEX "public"."TestCase_uniqueId_key";

-- AlterTable
ALTER TABLE "public"."TestCase" DROP COLUMN "uniqueId",
ADD COLUMN     "externalId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_externalId_key" ON "public"."TestCase"("externalId");

-- CreateIndex
CREATE INDEX "TestCase_projectId_externalId_idx" ON "public"."TestCase"("projectId", "externalId");

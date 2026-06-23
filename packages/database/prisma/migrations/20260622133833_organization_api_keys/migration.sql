/*
  Warnings:

  - You are about to drop the column `projectId` on the `ApiKey` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ApiKey" DROP CONSTRAINT "ApiKey_projectId_fkey";

-- DropIndex
DROP INDEX "public"."ApiKey_projectId_idx";

-- AlterTable
ALTER TABLE "public"."ApiKey" DROP COLUMN "projectId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "public"."ApiKey"("organizationId");

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

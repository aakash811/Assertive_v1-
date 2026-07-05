/*
  Warnings:

  - A unique constraint covering the columns `[projectId,externalId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TestCase_projectId_externalId_key" ON "public"."TestCase"("projectId", "externalId");

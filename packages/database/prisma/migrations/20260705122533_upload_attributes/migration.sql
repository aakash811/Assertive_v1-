-- AlterTable
ALTER TABLE "public"."RunBatch" ADD COLUMN     "uploadCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "uploadedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."ApiKey" ADD COLUMN     "lastUsedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "refreshToken" TEXT;

/*
  Warnings:

  - Added the required column `organizationId` to the `Bug` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bug" ADD COLUMN     "organizationId" TEXT;

-- Backfill organization from project
UPDATE "Bug"
SET "organizationId" = "Project"."organizationId"
FROM "Project"
WHERE "Bug"."projectId" = "Project"."id" AND "Bug"."organizationId" IS NULL;

-- Make required now that data is backfilled
ALTER TABLE "Bug" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Bug_organizationId_idx" ON "Bug"("organizationId");

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

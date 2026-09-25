-- AddIncidentKnowledge
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "IncidentKnowledge" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "testCaseId" TEXT,
    "testRunId" TEXT,
    "title" TEXT NOT NULL,
    "errorMessage" TEXT,
    "rootCause" TEXT,
    "suggestedFix" TEXT,
    "category" TEXT,
    "embedding" vector,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IncidentKnowledge_organizationId_idx" ON "IncidentKnowledge"("organizationId");

-- CreateIndex
CREATE INDEX "IncidentKnowledge_projectId_idx" ON "IncidentKnowledge"("projectId");
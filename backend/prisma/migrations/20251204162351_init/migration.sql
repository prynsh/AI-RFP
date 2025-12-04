-- CreateTable
CREATE TABLE "Rfp" (
    "id" SERIAL NOT NULL,
    "originalText" TEXT NOT NULL,
    "structured" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Rfp_id_key" ON "Rfp"("id");

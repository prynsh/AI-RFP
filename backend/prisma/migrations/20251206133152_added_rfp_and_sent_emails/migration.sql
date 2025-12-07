-- AlterTable
ALTER TABLE "Rfp" ADD CONSTRAINT "Rfp_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "Rfp_id_key";

-- CreateTable
CREATE TABLE "Vendors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentRfp" (
    "id" SERIAL NOT NULL,
    "rfpId" INTEGER NOT NULL,
    "vendorEmail" TEXT NOT NULL,
    "mailgunMessageId" TEXT NOT NULL,

    CONSTRAINT "SentRfp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Replies" (
    "id" SERIAL NOT NULL,
    "emailId" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "sentRfpId" INTEGER NOT NULL,

    CONSTRAINT "Replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendors_email_key" ON "Vendors"("email");

-- AddForeignKey
ALTER TABLE "SentRfp" ADD CONSTRAINT "SentRfp_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replies" ADD CONSTRAINT "Replies_sentRfpId_fkey" FOREIGN KEY ("sentRfpId") REFERENCES "SentRfp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

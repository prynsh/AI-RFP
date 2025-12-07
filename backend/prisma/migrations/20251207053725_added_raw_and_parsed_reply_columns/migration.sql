/*
  Warnings:

  - Added the required column `parsed` to the `Replies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Replies" ADD COLUMN     "parsed" TEXT NOT NULL;

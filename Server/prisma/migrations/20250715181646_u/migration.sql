/*
  Warnings:

  - Added the required column `invoice` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "invoice" TEXT NOT NULL;

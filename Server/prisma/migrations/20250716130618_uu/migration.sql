/*
  Warnings:

  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "method";

-- DropEnum
DROP TYPE "MediaType";

-- DropEnum
DROP TYPE "PaymentMethod";

/*
  Warnings:

  - A unique constraint covering the columns `[paypalOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "payerCountryCode" TEXT,
ADD COLUMN     "payerEmail" TEXT,
ADD COLUMN     "payerId" TEXT,
ADD COLUMN     "paymentGateway" TEXT,
ADD COLUMN     "paypalOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_paypalOrderId_key" ON "Order"("paypalOrderId");

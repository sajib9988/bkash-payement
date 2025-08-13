-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pathaoRecipientCityId" INTEGER,
ADD COLUMN     "pathaoRecipientZoneId" INTEGER,
ALTER COLUMN "shippingCountry" SET DEFAULT 'Bangladesh',
ALTER COLUMN "shippingZip" DROP NOT NULL;

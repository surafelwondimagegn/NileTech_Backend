/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `clientAddress` VARCHAR(191) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    ADD COLUMN `customPaymentDays` INTEGER NULL,
    ADD COLUMN `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `discountPercentage` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `includeShipping` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `includeTax` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `invoiceNumber` VARCHAR(191) NULL,
    ADD COLUMN `paymentTerms` VARCHAR(191) NOT NULL DEFAULT 'NET_30',
    ADD COLUMN `purchaseOrderNumber` VARCHAR(191) NULL,
    ADD COLUMN `shippingAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN `subtotal` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `taxRate` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `termsAndConditions` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `total` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `InvoiceItem` ADD COLUMN `discount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `discountPercentage` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `subtotal` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `taxRate` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `total` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalAfterDiscount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `useDefaultPrice` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_invoiceNumber_key` ON `Invoice`(`invoiceNumber`);

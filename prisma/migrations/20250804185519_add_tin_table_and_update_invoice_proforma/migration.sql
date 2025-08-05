-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `taxId` INTEGER NULL,
    ADD COLUMN `tinId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Proforma` ADD COLUMN `taxId` INTEGER NULL,
    ADD COLUMN `tinId` INTEGER NULL;

-- AlterTable
ALTER TABLE `ProformaItem` ADD COLUMN `taxId` INTEGER NULL,
    ADD COLUMN `useDefaultPrice` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Tax` ADD COLUMN `isVAT` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `TIN` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tinNumber` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TIN_tinNumber_key`(`tinNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_tinId_fkey` FOREIGN KEY (`tinId`) REFERENCES `TIN`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_taxId_fkey` FOREIGN KEY (`taxId`) REFERENCES `Tax`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proforma` ADD CONSTRAINT `Proforma_tinId_fkey` FOREIGN KEY (`tinId`) REFERENCES `TIN`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proforma` ADD CONSTRAINT `Proforma_taxId_fkey` FOREIGN KEY (`taxId`) REFERENCES `Tax`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProformaItem` ADD CONSTRAINT `ProformaItem_taxId_fkey` FOREIGN KEY (`taxId`) REFERENCES `Tax`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

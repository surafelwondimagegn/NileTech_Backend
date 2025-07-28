-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `clientEmail` VARCHAR(191) NULL,
    ADD COLUMN `clientPhone` VARCHAR(191) NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL;

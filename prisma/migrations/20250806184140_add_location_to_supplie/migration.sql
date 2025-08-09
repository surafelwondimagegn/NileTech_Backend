-- AlterTable
ALTER TABLE `projectproduct` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `projectservice` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `supplier` ADD COLUMN `supplierType` ENUM('COMPANY', 'PERSON') NOT NULL DEFAULT 'COMPANY';

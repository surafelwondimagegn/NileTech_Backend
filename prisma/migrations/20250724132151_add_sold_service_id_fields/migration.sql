-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `soldServiceId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Profit` ADD COLUMN `soldServiceId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Revenue` ADD COLUMN `soldServiceId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SoldService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serviceId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `sellingPrice` DOUBLE NOT NULL,
    `cost` DOUBLE NOT NULL,
    `totalRevenue` DOUBLE NOT NULL,
    `totalProfit` DOUBLE NOT NULL,
    `customerName` VARCHAR(191) NULL,
    `customerEmail` VARCHAR(191) NULL,
    `customerPhone` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `soldAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `taxId` INTEGER NULL,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_soldServiceId_fkey` FOREIGN KEY (`soldServiceId`) REFERENCES `SoldService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Revenue` ADD CONSTRAINT `Revenue_soldServiceId_fkey` FOREIGN KEY (`soldServiceId`) REFERENCES `SoldService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profit` ADD CONSTRAINT `Profit_soldServiceId_fkey` FOREIGN KEY (`soldServiceId`) REFERENCES `SoldService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoldService` ADD CONSTRAINT `SoldService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoldService` ADD CONSTRAINT `SoldService_taxId_fkey` FOREIGN KEY (`taxId`) REFERENCES `Tax`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

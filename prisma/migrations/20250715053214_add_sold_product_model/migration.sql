-- DropForeignKey
ALTER TABLE `Expense` DROP FOREIGN KEY `Expense_projectId_fkey`;

-- DropIndex
DROP INDEX `Expense_projectId_fkey` ON `Expense`;

-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `budgetId` INTEGER NULL,
    ADD COLUMN `fundingSource` VARCHAR(191) NOT NULL DEFAULT 'BUDGET',
    ADD COLUMN `soldProductId` INTEGER NULL,
    MODIFY `projectId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Profit` ADD COLUMN `soldProductId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Revenue` ADD COLUMN `soldProductId` INTEGER NULL;

-- CreateTable
CREATE TABLE `SoldProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `sellingPrice` DOUBLE NOT NULL,
    `buyingPrice` DOUBLE NOT NULL,
    `totalRevenue` DOUBLE NOT NULL,
    `totalProfit` DOUBLE NOT NULL,
    `customerName` VARCHAR(191) NULL,
    `customerEmail` VARCHAR(191) NULL,
    `customerPhone` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `soldAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_soldProductId_fkey` FOREIGN KEY (`soldProductId`) REFERENCES `SoldProduct`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `Budget`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Revenue` ADD CONSTRAINT `Revenue_soldProductId_fkey` FOREIGN KEY (`soldProductId`) REFERENCES `SoldProduct`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Profit` ADD CONSTRAINT `Profit_soldProductId_fkey` FOREIGN KEY (`soldProductId`) REFERENCES `SoldProduct`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoldProduct` ADD CONSTRAINT `SoldProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

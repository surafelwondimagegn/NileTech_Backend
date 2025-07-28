-- AlterTable
ALTER TABLE `ProjectProduct` ADD COLUMN `totalCost` DOUBLE NULL,
    ADD COLUMN `totalProfit` DOUBLE NULL,
    ADD COLUMN `unitCost` DOUBLE NULL;

-- AlterTable
ALTER TABLE `ProjectService` ADD COLUMN `totalCost` DOUBLE NULL,
    ADD COLUMN `totalProfit` DOUBLE NULL,
    ADD COLUMN `unitCost` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Service` ADD COLUMN `cost` DOUBLE NULL;

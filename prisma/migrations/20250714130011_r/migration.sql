/*
  Warnings:

  - You are about to drop the column `projectId` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Budget` DROP FOREIGN KEY `Budget_projectId_fkey`;

-- DropIndex
DROP INDEX `Budget_projectId_fkey` ON `Budget`;

-- AlterTable
ALTER TABLE `Budget` DROP COLUMN `projectId`;

-- AlterTable
ALTER TABLE `Project` DROP COLUMN `budget`,
    ADD COLUMN `budgetId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_budgetId_fkey` FOREIGN KEY (`budgetId`) REFERENCES `Budget`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `cost` on the `soldservice` table. All the data in the column will be lost.
  - Added the required column `unitExpense` to the `SoldService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `projectproduct` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `projectservice` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `soldservice` DROP COLUMN `cost`,
    ADD COLUMN `unitExpense` DOUBLE NOT NULL;

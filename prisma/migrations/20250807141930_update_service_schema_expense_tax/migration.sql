/*
  Warnings:

  - You are about to drop the column `cost` on the `service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `projectproduct` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `projectservice` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `service` DROP COLUMN `cost`,
    ADD COLUMN `expense` DOUBLE NULL;

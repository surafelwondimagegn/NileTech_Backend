/*
  Warnings:

  - You are about to drop the column `supplierContact` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `supplierName` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `supplierContact`,
    DROP COLUMN `supplierName`;

-- AlterTable
ALTER TABLE `projectproduct` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `projectservice` ALTER COLUMN `updatedAt` DROP DEFAULT;

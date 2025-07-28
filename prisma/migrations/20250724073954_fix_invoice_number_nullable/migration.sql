/*
  Warnings:

  - You are about to drop the column `barcode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `dimensions` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Product_barcode_key` ON `Product`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `barcode`,
    DROP COLUMN `dimensions`;

/*
  Warnings:

  - You are about to alter the column `quality` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `Product` MODIFY `quality` ENUM('BRAND_NEW', 'SECOND_HAND', 'REFURBISHED', 'USED') NOT NULL DEFAULT 'BRAND_NEW';

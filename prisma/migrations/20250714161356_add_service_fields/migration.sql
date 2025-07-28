/*
  Warnings:

  - A unique constraint covering the columns `[serviceCode]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Service` ADD COLUMN `duration` INTEGER NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `requirements` VARCHAR(191) NULL,
    ADD COLUMN `serviceCode` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `warrantyDays` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Service_serviceCode_key` ON `Service`(`serviceCode`);

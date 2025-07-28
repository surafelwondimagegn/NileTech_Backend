/*
  Warnings:

  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(0))`.
  - Added the required column `updatedAt` to the `ProjectProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectService` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Project_assignedToId_fkey`;

-- DropIndex
DROP INDEX `Project_assignedToId_fkey` ON `Project`;

-- AlterTable
ALTER TABLE `Project` ADD COLUMN `actualHours` INTEGER NULL,
    ADD COLUMN `allowClientUpdates` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `estimatedHours` INTEGER NULL,
    ADD COLUMN `internalNotes` TEXT NULL,
    ADD COLUMN `isPublic` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `priority` VARCHAR(191) NULL DEFAULT 'MEDIUM',
    MODIFY `assignedToId` INTEGER NULL,
    MODIFY `clientFeedback` TEXT NULL,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `ProjectHistory` ADD COLUMN `newValue` TEXT NULL,
    ADD COLUMN `oldValue` TEXT NULL;

-- AlterTable
ALTER TABLE `ProjectProduct` ADD COLUMN `discount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `installedDate` DATETIME(3) NULL,
    ADD COLUMN `orderDate` DATETIME(3) NULL,
    ADD COLUMN `receivedDate` DATETIME(3) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL DEFAULT 'PENDING',
    ADD COLUMN `totalPrice` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `notes` TEXT NULL;

-- Update existing records to set updatedAt to createdAt
UPDATE `ProjectProduct` SET `updatedAt` = `createdAt` WHERE `updatedAt` IS NULL;

-- AlterTable
ALTER TABLE `ProjectService` ADD COLUMN `assignedTo` INTEGER NULL,
    ADD COLUMN `discount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL DEFAULT 'PENDING',
    ADD COLUMN `totalPrice` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `notes` TEXT NULL;

-- Update existing records to set updatedAt to createdAt
UPDATE `ProjectService` SET `updatedAt` = `createdAt` WHERE `updatedAt` IS NULL;

-- Update existing CLIENT roles to USER before changing the enum
UPDATE `User` SET `role` = 'USER' WHERE `role` = 'CLIENT';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `role` ENUM('OWNER', 'MANAGER', 'STOREKEEPER', 'DEVELOPER', 'USER', 'ADMIN', 'TECHNICIAN') NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_lastUpdatedBy_fkey` FOREIGN KEY (`lastUpdatedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;



-- AddForeignKey
ALTER TABLE `ProjectService` ADD CONSTRAINT `ProjectService_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;



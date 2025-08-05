/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `contractEndDate` DATETIME(3) NULL,
    ADD COLUMN `contractStartDate` DATETIME(3) NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `employeeId` VARCHAR(191) NULL,
    ADD COLUMN `employeeStatus` ENUM('ACTIVE', 'PENDING_HIRE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RETIRED', 'PROBATION', 'CONTRACT_ENDED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `employmentType` VARCHAR(191) NULL,
    ADD COLUMN `lastLeaveDate` DATETIME(3) NULL,
    ADD COLUMN `leaveBalance` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `managerId` INTEGER NULL,
    ADD COLUMN `nextLeaveRequest` DATETIME(3) NULL,
    ADD COLUMN `position` VARCHAR(191) NULL,
    ADD COLUMN `probationEndDate` DATETIME(3) NULL,
    ADD COLUMN `statusChangeReason` VARCHAR(191) NULL,
    ADD COLUMN `statusChangedAt` DATETIME(3) NULL,
    ADD COLUMN `statusChangedBy` INTEGER NULL,
    ADD COLUMN `totalLeaveDays` DOUBLE NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `UserStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `oldStatus` ENUM('ACTIVE', 'PENDING_HIRE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RETIRED', 'PROBATION', 'CONTRACT_ENDED') NULL,
    `newStatus` ENUM('ACTIVE', 'PENDING_HIRE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED', 'RETIRED', 'PROBATION', 'CONTRACT_ENDED') NOT NULL,
    `reason` VARCHAR(191) NULL,
    `changedBy` INTEGER NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `leaveType` ENUM('ANNUAL_LEAVE', 'SICK_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE', 'UNPAID_LEAVE', 'STUDY_LEAVE', 'BEREAVEMENT_LEAVE', 'OTHER') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalDays` DOUBLE NOT NULL,
    `reason` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `approvedBy` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_employeeId_key` ON `User`(`employeeId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserStatusHistory` ADD CONSTRAINT `UserStatusHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserStatusHistory` ADD CONSTRAINT `UserStatusHistory_changedBy_fkey` FOREIGN KEY (`changedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

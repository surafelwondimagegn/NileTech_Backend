/*
  Warnings:

  - You are about to alter the column `type` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(10))`.
  - You are about to alter the column `status` on the `Payroll` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(11))`.

*/
-- AlterTable
ALTER TABLE `Payroll` ADD COLUMN `allowances` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `baseSalary` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `bonusAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `commissionAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `deductions` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `grossPay` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `healthInsurance` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `netPay` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `overtimeAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `overtimeHours` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `overtimeRate` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `paymentReference` VARCHAR(191) NULL,
    ADD COLUMN `processedBy` INTEGER NULL,
    ADD COLUMN `reimbursementAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `socialSecurity` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `workingDays` INTEGER NULL,
    ADD COLUMN `workingHours` DOUBLE NULL,
    MODIFY `type` ENUM('SALARY', 'BONUS', 'OVERTIME', 'DEDUCTION', 'ALLOWANCE', 'COMMISSION', 'REIMBURSEMENT') NOT NULL DEFAULT 'SALARY',
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'PAID', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `baseSalary` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `hourlyRate` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `isHourlyEmployee` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `joinDate` DATETIME(3) NULL,
    ADD COLUMN `lastSalaryReview` DATETIME(3) NULL,
    ADD COLUMN `nextSalaryReview` DATETIME(3) NULL,
    ADD COLUMN `payPeriod` ENUM('WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY';

-- CreateTable
CREATE TABLE `SalaryHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `oldSalary` DOUBLE NULL,
    `newSalary` DOUBLE NOT NULL,
    `changeType` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `effectiveDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedBy` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payroll` ADD CONSTRAINT `Payroll_processedBy_fkey` FOREIGN KEY (`processedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalaryHistory` ADD CONSTRAINT `SalaryHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalaryHistory` ADD CONSTRAINT `SalaryHistory_approvedBy_fkey` FOREIGN KEY (`approvedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

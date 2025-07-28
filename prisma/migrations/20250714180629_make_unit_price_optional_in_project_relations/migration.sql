-- AlterTable
ALTER TABLE `BudgetHistory` MODIFY `oldValue` TEXT NULL,
    MODIFY `newValue` TEXT NULL;

-- AlterTable
ALTER TABLE `ProjectProduct` MODIFY `unitPrice` DOUBLE NULL;

-- AlterTable
ALTER TABLE `ProjectService` MODIFY `unitPrice` DOUBLE NULL;

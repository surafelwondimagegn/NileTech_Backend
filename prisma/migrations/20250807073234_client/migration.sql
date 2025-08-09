-- DropForeignKey
ALTER TABLE `project` DROP FOREIGN KEY `Project_clientId_fkey`;

-- DropIndex
DROP INDEX `Project_clientId_fkey` ON `project`;

-- AlterTable
ALTER TABLE `invoice` MODIFY `clientName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `project` MODIFY `clientName` VARCHAR(191) NULL,
    MODIFY `clientId` INTEGER NULL;

-- AlterTable
ALTER TABLE `projectproduct` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `projectservice` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Budget` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT 'Budget';

-- Update existing records with unique names
UPDATE `Budget` SET `name` = CONCAT('Budget ', id) WHERE `name` = 'Budget';

-- CreateIndex
CREATE UNIQUE INDEX `Budget_name_key` ON `Budget`(`name`);

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` TEXT NOT NULL,
    `answers` JSON NOT NULL,
    `test_answer` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `difficulty` INTEGER NOT NULL,
    `Level_Id` INTEGER NOT NULL,

    INDEX `Question_Level_Id_idx`(`Level_Id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_Level_Id_fkey` FOREIGN KEY (`Level_Id`) REFERENCES `level`(`Level_Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

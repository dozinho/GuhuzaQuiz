-- CreateTable
CREATE TABLE `question` (
    `Question_Id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` TEXT NOT NULL,
    `answers` TEXT NOT NULL,
    `test_answer` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `difficulty` INTEGER NOT NULL,
    `Level_Id` INTEGER NOT NULL,

    INDEX `question_Level_Id_idx`(`Level_Id`),
    PRIMARY KEY (`Question_Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_Level_Id_fkey` FOREIGN KEY (`Level_Id`) REFERENCES `level`(`Level_Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

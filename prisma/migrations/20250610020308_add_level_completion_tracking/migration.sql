-- CreateTable
CREATE TABLE `LevelCompletion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Player_Id` INTEGER NOT NULL,
    `Level_Id` INTEGER NOT NULL,
    `completionTime` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LevelCompletion_Player_Id_idx`(`Player_Id`),
    INDEX `LevelCompletion_Level_Id_idx`(`Level_Id`),
    UNIQUE INDEX `LevelCompletion_Player_Id_Level_Id_completedAt_key`(`Player_Id`, `Level_Id`, `completedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LevelCompletion` ADD CONSTRAINT `LevelCompletion_Player_Id_fkey` FOREIGN KEY (`Player_Id`) REFERENCES `player`(`Player_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LevelCompletion` ADD CONSTRAINT `LevelCompletion_Level_Id_fkey` FOREIGN KEY (`Level_Id`) REFERENCES `level`(`Level_Id`) ON DELETE RESTRICT ON UPDATE CASCADE;

"use client";

import React from "react";
import QuizLevelCard from "./quizLevelCard";
import fetchPlayers from "@/utils/fPlayers";

type levelType = {
  Level_Id: number;
  Level_Title: string;
  Level_number: number;
};

type levelsType = levelType[];

export default function QuizList({ allLevels, cutEnding = true, playerLevel }: { allLevels: levelsType; cutEnding: boolean; playerLevel: number }) {
  const displayLevel = playerLevel;

  // Filter levels up to the player's current level, maintain ascending order
  const filteredLevels = allLevels
    .filter((level: levelType) => level.Level_Id <= displayLevel)
    .sort((a, b) => a.Level_Id - b.Level_Id);  // Changed to ascending order

  // If cutting the ending, show only the last 4 levels
  const startPoint = cutEnding ? Math.max(0, filteredLevels.length - 4) : 0;
  const levelsToShow = filteredLevels.slice(startPoint);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="">
      {levelsToShow.map((level: levelType) => (
        <QuizLevelCard
          key={level.Level_Id}
          levelNumber={level.Level_Id}
          levelLink={`quiz/${level.Level_Id}`}
          levelName={level.Level_Title}
          currentLevel={displayLevel}
        />
      ))}

      {!cutEnding && (
        <div className="py-20 w-full flex">
          <button 
            onClick={scrollToTop}
            className="underline text-center font-semibold mx-auto px-auto"
          >
            Scroll To Top
          </button>
        </div>
      )}
    </div>
  );
}

import React, { Suspense } from "react";
import QuizLevelCard from "./quizLevelCard";
import fetchLevels from "@/utils/fLevels";
import QuizList from "./quizList";
import Link from "next/link";

type typeDisplayLevel = {
  playerLevel: number;
};

async function QuizLevelSections({ playerLevel }: typeDisplayLevel) {
  const levels = (await fetchLevels()) || [];

  return (
    <div className="space-y-8">
      <div className="container flex lg:gap-12 flex-wrap">
        <h2 className="px-4 lg:py-1 bg-blue-400 text-4xl w-fit rounded font-bold text-gray-900 lg:mb-10 mb-4">
          Your Journey
        </h2>
        <p className="w-96">
          You will unlock new level as you complete the top level. New
          Challenges will appear as you grow
        </p>
      </div>
      <div className="container grid lg:gap-16 gap-8">
        <Suspense fallback={<div>Loading....</div>}>
          <QuizList
            cutEnding={true}
            allLevels={levels}
            playerLevel={playerLevel}
          />
        </Suspense>

        <Link href="/allquiz" className="font-semibold underline text-center">
          View All Quiz
        </Link>
      </div>
    </div>
  );
}

export default QuizLevelSections;

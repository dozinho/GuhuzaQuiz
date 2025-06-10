"use client";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import ProgressView from "../components/progressView";
import LevelStats from "../components/levelStats";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProgressPage() {
  const [playerData, setPlayerData] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [levelStats, setLevelStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await auth();
        if (!session?.user) {
          redirect('/api/auth/signin');
        }

        const memberId = Number(session.user.memberId);
        
        // Fetch player's basic info and completion history
        const response = await fetch(`/api/level-stats?playerId=${memberId}`);
        const data = await response.json();
        setPlayerData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching progress data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLevelStats = async () => {
      if (selectedLevel) {
        try {
          const session = await auth();
          if (!session?.user) return;

          const memberId = Number(session.user.memberId);
          const response = await fetch(`/api/level-stats?playerId=${memberId}&levelId=${selectedLevel}`);
          const data = await response.json();
          setLevelStats(data);
        } catch (error) {
          console.error("Error fetching level stats:", error);
        }
      } else {
        setLevelStats(null);
      }
    };

    fetchLevelStats();
  }, [selectedLevel]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!playerData?.levels?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Progress History</h1>
        <p>No progress data available. Start playing to see your progress!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          
          {/* Level Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Select a Level</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {playerData.levels.map((level: any) => (
                <button
                  key={level.levelId}
                  onClick={() => setSelectedLevel(level.levelId)}
                  className={`p-4 rounded-lg transition-all ${
                    selectedLevel === level.levelId
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-white hover:bg-gray-50 shadow'
                  }`}
                >
                  <h3 className="font-semibold">{level.levelTitle}</h3>
                  <p className="text-sm opacity-75">
                    {selectedLevel === level.levelId ? 'Selected' : `${level.totalAttempts} attempts`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Level Stats */}
          {selectedLevel && levelStats?.stats ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Level {playerData.levels.find((l: any) => l.levelId === selectedLevel)?.levelTitle} Stats
              </h2>
              <LevelStats stats={levelStats.stats} />
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-blue-700">
                Select a level above to view detailed statistics.
              </p>
            </div>
          )}

          {/* Overall Progress */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
            <ProgressView completions={playerData.levels.flatMap((level: any) => level.completions)} />
          </div>
        </div>
      </div>
    </div>
  );
} 
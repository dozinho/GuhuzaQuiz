import React from 'react';
import { formatDistanceToNow } from 'date-fns';

type LevelStatsProps = {
  stats: {
    totalAttempts: number;
    bestTime: number;
    averageTime: number;
    bestScore: number;
    averageScore: number;
    timeImprovement: number;
    scoreImprovement: number;
    firstAttempt: {
      completionTime: number;
      score: number;
      completedAt: Date;
    };
    latestAttempt: {
      completionTime: number;
      score: number;
      completedAt: Date;
    };
  };
};

// Helper function to format time in mm:ss
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function LevelStats({ stats }: LevelStatsProps) {
  const {
    totalAttempts,
    bestTime,
    averageTime,
    bestScore,
    averageScore,
    timeImprovement,
    scoreImprovement,
    firstAttempt,
    latestAttempt
  } = stats;

  const timeImprovementPercent = ((firstAttempt.completionTime - latestAttempt.completionTime) / firstAttempt.completionTime) * 100;
  const scoreImprovementPercent = ((latestAttempt.score - firstAttempt.score) / firstAttempt.score) * 100;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Attempts</h3>
          <p className="text-3xl font-bold">{totalAttempts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Best Time</h3>
          <p className="text-3xl font-bold font-mono">{formatTime(bestTime)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Best Score</h3>
          <p className="text-3xl font-bold">{bestScore}</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
        
        {/* Time Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Completion Time</span>
            <span className="text-sm font-medium">
              {timeImprovement > 0 ? (
                <span className="text-green-600">
                  -{formatTime(timeImprovement)} ({timeImprovementPercent.toFixed(1)}%)
                </span>
              ) : (
                <span className="text-gray-600">No improvement yet</span>
              )}
            </span>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Latest: {formatTime(latestAttempt.completionTime)}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200">
                  First: {formatTime(firstAttempt.completionTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Progress */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Score</span>
            <span className="text-sm font-medium">
              {scoreImprovement > 0 ? (
                <span className="text-green-600">
                  +{scoreImprovement} ({scoreImprovementPercent.toFixed(1)}%)
                </span>
              ) : (
                <span className="text-gray-600">No improvement yet</span>
              )}
            </span>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  Latest: {latestAttempt.score}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200">
                  First: {firstAttempt.score}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Averages Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Averages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Average Time</h4>
            <p className="text-2xl font-bold font-mono">{formatTime(averageTime)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Average Score</h4>
            <p className="text-2xl font-bold">{Math.round(averageScore)}</p>
          </div>
        </div>
      </div>

      {/* First vs Latest Attempt */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">First vs Latest Attempt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">First Attempt</h4>
            <div className="space-y-2">
              <p className="text-sm">Time: {formatTime(firstAttempt.completionTime)}</p>
              <p className="text-sm">Score: {firstAttempt.score}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(firstAttempt.completedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Latest Attempt</h4>
            <div className="space-y-2">
              <p className="text-sm">Time: {formatTime(latestAttempt.completionTime)}</p>
              <p className="text-sm">Score: {latestAttempt.score}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(latestAttempt.completedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
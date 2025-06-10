import React from 'react';
import { formatDistanceToNow } from 'date-fns';

type LevelCompletionType = {
  id: number;
  completionTime: number;
  score: number;
  completedAt: Date;
  level: {
    Level_Title: string;
    Level_number: number;
  };
};

type ProgressViewProps = {
  completions: LevelCompletionType[];
};

// Helper function to format time in mm:ss
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function ProgressView({ completions }: ProgressViewProps) {
  // Group completions by level
  const completionsByLevel = completions.reduce((acc, completion) => {
    const levelId = completion.level.Level_number;
    if (!acc[levelId]) {
      acc[levelId] = [];
    }
    acc[levelId].push(completion);
    return acc;
  }, {} as Record<number, LevelCompletionType[]>);

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Your Progress History</h2>
      <div className="space-y-6">
        {Object.entries(completionsByLevel).map(([levelId, levelCompletions]) => {
          // Sort completions by date, most recent first
          const sortedCompletions = [...levelCompletions].sort(
            (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
          );
          
          // Get best time for this level
          const bestTime = Math.min(...sortedCompletions.map(c => c.completionTime));
          
          return (
            <div key={levelId} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {sortedCompletions[0].level.Level_Title}
                </h3>
                <div className="text-sm text-gray-600">
                  Best Time: <span className="font-mono">{formatTime(bestTime)}</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-sm font-medium text-gray-500">
                      <th className="pb-2">Attempt</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Score</th>
                      <th className="pb-2">Improvement</th>
                      <th className="pb-2">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {sortedCompletions.map((completion, index) => {
                      const previousTime = index < sortedCompletions.length - 1 
                        ? sortedCompletions[index + 1].completionTime 
                        : null;
                      const improvement = previousTime 
                        ? previousTime - completion.completionTime 
                        : 0;

                      return (
                        <tr key={completion.id} className="border-t border-gray-100">
                          <td className="py-2">{sortedCompletions.length - index}</td>
                          <td className="py-2 font-mono">
                            {formatTime(completion.completionTime)}
                          </td>
                          <td className="py-2">{completion.score}</td>
                          <td className="py-2">
                            {improvement > 0 ? (
                              <span className="text-green-600">-{formatTime(improvement)}</span>
                            ) : improvement < 0 ? (
                              <span className="text-red-600">+{formatTime(Math.abs(improvement))}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-2 text-gray-500">
                            {formatDistanceToNow(new Date(completion.completedAt), { addSuffix: true })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
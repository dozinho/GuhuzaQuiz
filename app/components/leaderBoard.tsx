import { auth } from "@/auth";
import fetchPlayers from "@/utils/fPlayers";
import fetchRank from "@/utils/fRanking";
import fetchUser from "@/utils/fUser";

type LevelCompletionType = {
  id: number;
  completionTime: number;
  score: number;
  completedAt: Date;
};

type PlayerType = {
  Player_ID: number;
  Player_name: string;
  Playerpoint: number;
  streak: number;
  lastLogin: Date;
  Level_Id?: number;
  Milestone_Id?: number;
  bestTime?: number;
  averageTime?: number;
  totalQuizzes: number;
  level?: {
    Level_Title: string;
    Level_number: number;
  };
  completions: LevelCompletionType[];
};

// Helper function to format time in mm:ss
function formatTime(seconds: number | undefined | null): string {
  if (!seconds) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default async function LeaderBoard() {
  const Players = (await fetchPlayers()) || [];
  const session = await auth();
  const user = session?.user;
  const name = user?.firstName == null ? "Anonymous" : user?.firstName + " " + user?.lastName;

  const player = session ? await fetchUser(
    Number(user?.memberId),
    name,
    user?.email || ""
  ) : null;
  const playerId = session ? player?.Player_ID : null;
  const rank = player ? await fetchRank(player.Playerpoint) : 100;

  // Sort players by level first, then points, then average time
  const sortedPlayers = [...Players]?.sort((a, b) => {
    if (a.Level_Id !== b.Level_Id) {
      return (b.Level_Id || 0) - (a.Level_Id || 0);
    }
    if (a.Playerpoint !== b.Playerpoint) {
      return b.Playerpoint - a.Playerpoint;
    }
    return (a.averageTime || Infinity) - (b.averageTime || Infinity);
  });

  // Get the top 5 players
  let topPlayers = sortedPlayers?.slice(0, 5);
  
  // Check if the current player is in the top 5
  const isPlayerInTop5 = topPlayers?.some((p) => p?.Player_ID === playerId);

  // If the current player is not in the top 5, add them to the table
  if (!isPlayerInTop5 && playerId) {
    const currentPlayer = Players?.find((p) => p?.Player_ID === playerId);
    if (currentPlayer) {
      topPlayers.push(currentPlayer);
    }
  }

  return (
    <div className="py-24">
      <div className="container">
        <h2 className="px-4 py-1 text-center bg-blue-400 text-4xl w-fit rounded font-bold text-gray-900 m-auto intersect:motion-preset-slide-up motion-delay-200 intersect-once">
          LeaderBoard
        </h2>
      
        <p className="w-96 m-auto text-center mt-6 mb-10 intersect:motion-preset-slide-up motion-delay-200 intersect-once">
          Check our top performers
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="intersect:motion-preset-slide-up motion-delay-200 intersect-once min-w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <thead className="bg-gradient-to-b from-gray-950 to-gray-800 text-white uppercase text-sm font-semibold">
            <tr>
              <th className="px-4 py-3 text-left tracking-wider">Rank</th>
              <th className="px-4 py-3 text-left tracking-wider">Name</th>
              <th className="px-4 py-3 text-left tracking-wider">Level</th>
              <th className="px-4 py-3 text-left tracking-wider">Points</th>
              <th className="px-4 py-3 text-left tracking-wider">Current Level Best</th>
              <th className="px-4 py-3 text-left tracking-wider">Overall Best</th>
              <th className="px-4 py-3 text-left tracking-wider">Avg Time</th>
              <th className="px-4 py-3 text-left tracking-wider">Total Quizzes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {topPlayers.map((playerData, index) => {
              const isCurrentPlayer = playerData?.Player_ID === playerId;
              const leaderBoardRank = isCurrentPlayer ? rank : index + 1;
              const rowClass = isCurrentPlayer ? "bg-blue-100 font-semibold text-gray-900" : "";

              // Get best time for current level
              const currentLevelBestTime = playerData.completions
                ?.filter(c => c.Level_Id === playerData.Level_Id)
                ?.reduce((best, current) => 
                  Math.min(best, current.completionTime), 
                  Infinity
                );

              return (
                <tr
                  key={playerData?.Player_ID}
                  className={`${rowClass} transition-all hover:bg-gray-50`}
                >
                  <td className="px-4 py-4 text-sm">
                    {leaderBoardRank}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {playerData?.Player_name}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {playerData?.level?.Level_Title || `Level ${playerData?.Level_Id || 1}`}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {playerData?.Playerpoint}
                  </td>
                  <td className="px-4 py-4 text-sm font-mono">
                    {formatTime(currentLevelBestTime === Infinity ? null : currentLevelBestTime)}
                  </td>
                  <td className="px-4 py-4 text-sm font-mono">
                    {formatTime(playerData?.bestTime)}
                  </td>
                  <td className="px-4 py-4 text-sm font-mono">
                    {formatTime(playerData?.averageTime)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {playerData?.totalQuizzes || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

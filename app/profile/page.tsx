import React from "react";
import QuizLevelSections from "../components/quizLevelSections";
import LeaderBoard from "../components/leaderBoard";
import ProfileHerosection from "../components/profileHerosection";
import LeaderBoardSection from "../components/leaderBoardSection";
import { auth } from "@/auth";
import fetchUser from "@/utils/fUser";
import LoginButton from "../components/buttons/loginBtn";
import fetchRank from "@/utils/fRanking";





async function Profile() {
  const session = await auth();
  if(session) { 
    const user = session?.user;
    const name = user?.firstName == null ? "Anonymous" :user?.firstName 

    const player = await fetchUser(
      Number(user?.memberId),
      name,
      user?.email || ""
    );
    const playerPoint:number = player ? player.Playerpoint : 0
    const playerRank = player ? await fetchRank(Number(playerPoint)) : 100
    const playerLevel = player?.Level_Id ?? 1;

    // Fetch player's quiz history and progress
    const quizHistory = player?.completions?.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ) || [];

    return (
      <div className="p-6 min-h-screen">
        <ProfileHerosection player={player ?? null} playerRank={playerRank}/>
        
        {/* Progress Overview */}
        <div className="mt-12 container">
          <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Current Level</h3>
              <p className="text-3xl font-bold text-blue-600">Level {playerLevel}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Total Points</h3>
              <p className="text-3xl font-bold text-green-600">{playerPoint}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Quizzes Completed</h3>
              <p className="text-3xl font-bold text-purple-600">{player?.totalQuizzes || 0}</p>
            </div>
          </div>
        </div>

        {/* Quiz History */}
        <div className="mt-12 container">
          <h2 className="text-2xl font-bold mb-6">Recent Quiz History</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No quiz history available. Start playing to see your progress!
                      </td>
                    </tr>
                  ) : (
                    quizHistory.map((completion, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                            Level {completion.Level_Id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          {completion.score} pts
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono">
                          {Math.floor(completion.completionTime / 60)}:{(completion.completionTime % 60).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(completion.completedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <QuizLevelSections playerLevel={playerLevel}/>
        </div>
        
        <div className="mt-12 container">
          <LeaderBoardSection/>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full">
      <div className="px-8 my-32 rounded py-8 border-2 mx-auto w-fit bg-white">
        <div className="">
          <h1 className="title mb-5 w-32">Log in Required</h1>
          <p>You have to login in order to access this page</p>
          <div>
            <div className="mt-5 w-full">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

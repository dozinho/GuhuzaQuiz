import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      where: {
        totalQuizzes: {
          gt: 0 // Only include players who have completed at least one quiz
        }
      },
      orderBy: [
        { Level_Id: 'desc' },     // First by level (highest first)
        { Playerpoint: 'desc' },  // Then by points (highest first)
        { averageTime: 'asc' }    // Then by average time (lowest first)
      ],
      take: 10,
      select: {
        Player_ID: true,
        Player_name: true,
        Playerpoint: true,
        Level_Id: true,
        bestTime: true,
        averageTime: true,
        totalQuizzes: true,
        level: {
          select: {
            Level_Title: true
          }
        }
      }
    });

    // Calculate ranks and format response
    const rankedPlayers = players.map((player, index) => ({
      rank: index + 1,
      ...player,
      averageTime: player.averageTime?.toFixed(1) || '0', // Format to 1 decimal place
      bestTime: player.bestTime || 0,
      level: player.level?.Level_Title || 'Not Started'
    }));

    return NextResponse.json(rankedPlayers, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { message: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { playerId, score, completionTime } = await req.json();

    if (!playerId || score === undefined || completionTime === undefined) {
      return NextResponse.json(
        { message: "Player ID, score, and completion time are required" },
        { status: 400 }
      );
    }

    // Get current player data
    const currentPlayer = await prisma.player.findUnique({
      where: { Player_ID: playerId },
      select: {
        totalQuizzes: true,
        averageTime: true,
        bestTime: true
      }
    });

    if (!currentPlayer) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    // Calculate new average time
    const totalQuizzes = currentPlayer.totalQuizzes + 1;
    const currentTotalTime = (currentPlayer.averageTime || 0) * currentPlayer.totalQuizzes;
    const newAverageTime = (currentTotalTime + completionTime) / totalQuizzes;

    // Update player stats
    const updatedPlayer = await prisma.player.update({
      where: {
        Player_ID: playerId
      },
      data: {
        Playerpoint: score,
        totalQuizzes: totalQuizzes,
        averageTime: newAverageTime,
        bestTime: currentPlayer.bestTime === null || completionTime < currentPlayer.bestTime 
          ? completionTime 
          : currentPlayer.bestTime
      },
      select: {
        Player_ID: true,
        Player_name: true,
        Playerpoint: true,
        Level_Id: true,
        bestTime: true,
        averageTime: true,
        totalQuizzes: true,
        level: {
          select: {
            Level_Title: true
          }
        }
      }
    });

    return NextResponse.json(updatedPlayer, { status: 200 });
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return NextResponse.json(
      { message: "Failed to update leaderboard" },
      { status: 500 }
    );
  }
} 
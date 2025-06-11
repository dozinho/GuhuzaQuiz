import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { playerId, levelId, score, completionTime } = await req.json();

    if (!playerId || !levelId || score === undefined || completionTime === undefined) {
      return NextResponse.json(
        { message: "Player ID, Level ID, score, and completion time are required" },
        { status: 400 }
      );
    }

    // Record the level completion
    const levelCompletion = await prisma.levelCompletion.create({
      data: {
        Player_Id: playerId,
        Level_Id: levelId,
        completionTime,
        score,
      }
    });

    // Get player's current stats
    const currentPlayer = await prisma.player.findUnique({
      where: { Player_ID: playerId },
      include: {
        completions: {
          orderBy: { completionTime: 'asc' }
        }
      }
    });

    if (!currentPlayer) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    // Calculate new stats
    const totalQuizzes = (currentPlayer.totalQuizzes || 0) + 1;
    const currentTotalTime = (currentPlayer.averageTime || 0) * (currentPlayer.totalQuizzes || 0);
    const newAverageTime = (currentTotalTime + completionTime) / totalQuizzes;
    
    // Get best time overall
    const newBestTime = currentPlayer.bestTime === null || completionTime < currentPlayer.bestTime 
      ? completionTime 
      : currentPlayer.bestTime;

    // Update player stats
    const updatedPlayer = await prisma.player.update({
      where: {
        Player_ID: playerId
      },
      data: {
        Playerpoint: {
          increment: score
        },
        totalQuizzes: totalQuizzes,
        averageTime: newAverageTime,
        bestTime: newBestTime,
        // Update level if this is their highest level
        Level_Id: currentPlayer.Level_Id && currentPlayer.Level_Id < levelId 
          ? levelId 
          : currentPlayer.Level_Id
      },
      include: {
        level: true,
        completions: {
          orderBy: { completedAt: 'desc' },
          take: 5 // Get last 5 completions for stats
        }
      }
    });

    return NextResponse.json({
      player: updatedPlayer,
      levelCompletion: levelCompletion
    }, { status: 200 });

  } catch (error) {
    console.error("Error recording quiz completion:", error);
    return NextResponse.json(
      { message: "Failed to record quiz completion" },
      { status: 500 }
    );
  }
} 
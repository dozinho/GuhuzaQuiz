import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const playerId = url.searchParams.get("playerId");
    const levelId = url.searchParams.get("levelId");

    if (!playerId) {
      return NextResponse.json(
        { message: "Player ID is required" },
        { status: 400 }
      );
    }

    // Base query to get level completions
    const query = {
      where: {
        Player_Id: parseInt(playerId),
        ...(levelId ? { Level_Id: parseInt(levelId) } : {})
      },
      include: {
        level: {
          select: {
            Level_Title: true,
            Level_number: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    };

    // Get all completions for the player
    const completions = await prisma.levelCompletion.findMany(query);

    // If a specific level is requested, calculate detailed stats for that level
    if (levelId) {
      const levelCompletions = completions;
      const totalAttempts = levelCompletions.length;
      
      if (totalAttempts === 0) {
        return NextResponse.json({
          message: "No completions found for this level",
          completions: [],
          stats: null
        });
      }

      // Calculate statistics
      const bestTime = Math.min(...levelCompletions.map(c => c.completionTime));
      const averageTime = levelCompletions.reduce((sum, c) => sum + c.completionTime, 0) / totalAttempts;
      const bestScore = Math.max(...levelCompletions.map(c => c.score));
      const averageScore = levelCompletions.reduce((sum, c) => sum + c.score, 0) / totalAttempts;
      
      // Calculate improvement over time
      const firstAttempt = levelCompletions[levelCompletions.length - 1];
      const latestAttempt = levelCompletions[0];
      const timeImprovement = firstAttempt.completionTime - latestAttempt.completionTime;
      const scoreImprovement = latestAttempt.score - firstAttempt.score;

      return NextResponse.json({
        completions: levelCompletions,
        stats: {
          totalAttempts,
          bestTime,
          averageTime,
          bestScore,
          averageScore,
          timeImprovement,
          scoreImprovement,
          firstAttempt,
          latestAttempt
        }
      });
    }

    // If no specific level is requested, group completions by level
    const completionsByLevel = completions.reduce((acc, completion) => {
      const levelId = completion.Level_Id;
      if (!acc[levelId]) {
        acc[levelId] = [];
      }
      acc[levelId].push(completion);
      return acc;
    }, {} as Record<number, typeof completions>);

    // Calculate summary stats for each level
    const levelStats = Object.entries(completionsByLevel).map(([levelId, levelCompletions]) => {
      const bestTime = Math.min(...levelCompletions.map(c => c.completionTime));
      const averageTime = levelCompletions.reduce((sum, c) => sum + c.completionTime, 0) / levelCompletions.length;
      const bestScore = Math.max(...levelCompletions.map(c => c.score));
      const averageScore = levelCompletions.reduce((sum, c) => sum + c.score, 0) / levelCompletions.length;

      return {
        levelId: parseInt(levelId),
        levelTitle: levelCompletions[0].level.Level_Title,
        levelNumber: levelCompletions[0].level.Level_number,
        totalAttempts: levelCompletions.length,
        bestTime,
        averageTime,
        bestScore,
        averageScore,
        latestAttempt: levelCompletions[0],
        firstAttempt: levelCompletions[levelCompletions.length - 1]
      };
    });

    return NextResponse.json({
      levels: levelStats
    });

  } catch (error) {
    console.error("Error fetching level statistics:", error);
    return NextResponse.json(
      { message: "Failed to fetch level statistics" },
      { status: 500 }
    );
  }
} 
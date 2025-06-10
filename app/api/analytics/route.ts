import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get user analytics and progress data
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const timeframe = searchParams.get("timeframe") || "all"; // all, week, month, year

    const startDate = new Date();
    switch (timeframe) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const analyticsData = await prisma.player.findUnique({
      where: { Player_ID: Number(userId) },
      include: {
        quiz_attempts: {
          where: timeframe !== "all" ? {
            completed_at: {
              gte: startDate
            }
          } : undefined,
          include: {
            quiz: true,
          }
        },
        achievements: true,
        statistics: {
          include: {
            category_performance: true,
            daily_stats: timeframe !== "all" ? {
              where: {
                date: {
                  gte: startDate
                }
              }
            } : true,
          }
        },
      }
    });

    // Calculate performance metrics
    const performance = {
      totalQuizzes: analyticsData?.quiz_attempts.length || 0,
      averageScore: analyticsData?.quiz_attempts.reduce((acc, curr) => acc + curr.score, 0) / (analyticsData?.quiz_attempts.length || 1),
      totalTime: analyticsData?.quiz_attempts.reduce((acc, curr) => acc + curr.time_taken, 0) || 0,
      categoryPerformance: analyticsData?.statistics?.category_performance || [],
      dailyProgress: analyticsData?.statistics?.daily_stats || [],
      achievements: analyticsData?.achievements || [],
    };

    return NextResponse.json(performance);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

// Record new analytics data
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      userId,
      quizId,
      score,
      timeTaken,
      correctAnswers,
      totalQuestions,
      categoryId,
    } = data;

    // Record quiz attempt
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        player_id: Number(userId),
        quiz_id: Number(quizId),
        score,
        time_taken: timeTaken,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        completed_at: new Date(),
      },
    });

    // Update category performance
    await prisma.categoryPerformance.upsert({
      where: {
        player_id_category_id: {
          player_id: Number(userId),
          category_id: Number(categoryId),
        },
      },
      update: {
        total_questions: { increment: totalQuestions },
        correct_answers: { increment: correctAnswers },
        total_time: { increment: timeTaken },
      },
      create: {
        player_id: Number(userId),
        category_id: Number(categoryId),
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        total_time: timeTaken,
      },
    });

    // Update daily statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyStats.upsert({
      where: {
        player_id_date: {
          player_id: Number(userId),
          date: today,
        },
      },
      update: {
        quizzes_completed: { increment: 1 },
        total_points: { increment: score },
        total_time: { increment: timeTaken },
      },
      create: {
        player_id: Number(userId),
        date: today,
        quizzes_completed: 1,
        total_points: score,
        total_time: timeTaken,
      },
    });

    return NextResponse.json(quizAttempt);
  } catch (error) {
    console.error("Error recording analytics:", error);
    return NextResponse.json({ error: "Failed to record analytics" }, { status: 500 });
  }
} 
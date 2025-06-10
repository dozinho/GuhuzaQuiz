import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get quiz settings and modes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    const quizSettings = await prisma.quiz.findUnique({
      where: { id: Number(quizId) },
      include: {
        difficulty_settings: true,
        available_powerups: true,
        categories: true,
      },
    });

    return NextResponse.json(quizSettings);
  } catch (error) {
    console.error("Error fetching quiz settings:", error);
    return NextResponse.json({ error: "Failed to fetch quiz settings" }, { status: 500 });
  }
}

// Update quiz settings
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const {
      quizId,
      mode, // 'timed', 'practice', 'challenge'
      difficulty,
      timeLimit,
      powerUpsEnabled,
      hintsAllowed,
      categoryId,
    } = data;

    const updatedQuiz = await prisma.quiz.update({
      where: { id: Number(quizId) },
      data: {
        mode,
        difficulty_settings: {
          upsert: {
            create: {
              level: difficulty,
              time_limit: timeLimit,
              powerups_enabled: powerUpsEnabled,
              hints_allowed: hintsAllowed,
            },
            update: {
              level: difficulty,
              time_limit: timeLimit,
              powerups_enabled: powerUpsEnabled,
              hints_allowed: hintsAllowed,
            },
          },
        },
        categories: {
          connect: { id: categoryId },
        },
      },
      include: {
        difficulty_settings: true,
        categories: true,
      },
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz settings:", error);
    return NextResponse.json({ error: "Failed to update quiz settings" }, { status: 500 });
  }
} 
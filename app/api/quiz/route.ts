import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");

    if (!level) {
      return NextResponse.json(
        { message: "Level parameter is required" },
        { status: 400 }
      );
    }

    const questions = await prisma.question.findMany({
      where: {
        Level_Id: parseInt(level)
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Transform the questions to match the expected format
    const formattedQuestions = questions.map(q => ({
      question: q.question,
      comment: q.comment || "",
      test_answer: q.test_answer,
      answers: JSON.parse(q.answers)
    }));

    return NextResponse.json({
      test: {
        test_group: parseInt(level),
        next_test_group: parseInt(level) + 1,
        question: formattedQuestions
      }
    });

  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return NextResponse.json(
      { message: "Failed to fetch quiz questions" },
      { status: 500 }
    );
  }
} 
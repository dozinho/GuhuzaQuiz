import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get user-created quizzes and content
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const filter = searchParams.get("filter") || "all"; // all, pending, approved, reported

    const contentQuery = {
      where: {
        created_by_id: Number(userId),
        ...(filter !== "all" && { status: filter }),
      },
      include: {
        categories: true,
        ratings: {
          include: {
            user: {
              select: {
                Player_name: true,
              },
            },
          },
        },
        reports: true,
      },
    };

    const userContent = await prisma.userCreatedQuiz.findMany(contentQuery);

    return NextResponse.json(userContent);
  } catch (error) {
    console.error("Error fetching user content:", error);
    return NextResponse.json({ error: "Failed to fetch user content" }, { status: 500 });
  }
}

// Create new quiz or content
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      userId,
      title,
      description,
      questions,
      categoryIds,
      difficulty,
      timeLimit,
      tags,
    } = data;

    const newQuiz = await prisma.userCreatedQuiz.create({
      data: {
        title,
        description,
        created_by_id: Number(userId),
        status: 'pending',
        difficulty,
        time_limit: timeLimit,
        questions: {
          create: questions.map((q: any) => ({
            question_text: q.text,
            correct_answer: q.correctAnswer,
            options: q.options,
            explanation: q.explanation,
          })),
        },
        categories: {
          connect: categoryIds.map((id: number) => ({ id })),
        },
        tags: {
          create: tags.map((tag: string) => ({
            name: tag,
          })),
        },
      },
      include: {
        questions: true,
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json(newQuiz);
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 });
  }
}

// Update quiz content or handle reports
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const {
      quizId,
      action, // 'update', 'rate', 'report'
      updates,
      rating,
      reportDetails,
    } = data;

    let result;

    switch (action) {
      case 'update':
        result = await prisma.userCreatedQuiz.update({
          where: { id: Number(quizId) },
          data: updates,
          include: {
            questions: true,
            categories: true,
            tags: true,
          },
        });
        break;

      case 'rate':
        result = await prisma.quizRating.create({
          data: {
            quiz_id: Number(quizId),
            user_id: Number(rating.userId),
            rating: rating.score,
            comment: rating.comment,
          },
        });
        break;

      case 'report':
        result = await prisma.quizReport.create({
          data: {
            quiz_id: Number(quizId),
            reported_by_id: Number(reportDetails.userId),
            reason: reportDetails.reason,
            description: reportDetails.description,
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

// Delete quiz content
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    await prisma.userCreatedQuiz.delete({
      where: { id: Number(quizId) },
    });

    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
} 
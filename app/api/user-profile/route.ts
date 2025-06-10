import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get user profile
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userProfile = await prisma.player.findUnique({
      where: { Player_ID: Number(userId) },
      include: {
        settings: true,
        achievements: true,
        statistics: true,
        friends: true,
      },
    });

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

// Update user profile
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const {
      userId,
      avatar,
      theme,
      soundEnabled,
      language,
      notifications,
    } = data;

    const updatedProfile = await prisma.player.update({
      where: { Player_ID: Number(userId) },
      data: {
        settings: {
          upsert: {
            create: { avatar, theme, soundEnabled, language, notifications },
            update: { avatar, theme, soundEnabled, language, notifications },
          },
        },
      },
      include: {
        settings: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
  }
} 
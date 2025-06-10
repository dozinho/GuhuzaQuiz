import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Get friends list and social data
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const socialData = await prisma.player.findUnique({
      where: { Player_ID: Number(userId) },
      include: {
        friends: true,
        sent_challenges: true,
        received_challenges: true,
        achievements: true,
        team_memberships: {
          include: {
            team: true,
          },
        },
      },
    });

    return NextResponse.json(socialData);
  } catch (error) {
    console.error("Error fetching social data:", error);
    return NextResponse.json({ error: "Failed to fetch social data" }, { status: 500 });
  }
}

// Add friend or send challenge
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      userId,
      friendId,
      action, // 'add_friend', 'send_challenge', 'create_team'
      challengeDetails,
      teamDetails,
    } = data;

    let result;

    switch (action) {
      case 'add_friend':
        result = await prisma.friendship.create({
          data: {
            user_id: Number(userId),
            friend_id: Number(friendId),
            status: 'pending',
          },
        });
        break;

      case 'send_challenge':
        result = await prisma.challenge.create({
          data: {
            sender_id: Number(userId),
            receiver_id: Number(friendId),
            quiz_id: challengeDetails.quizId,
            expires_at: challengeDetails.expiresAt,
            reward_points: challengeDetails.rewardPoints,
          },
        });
        break;

      case 'create_team':
        result = await prisma.team.create({
          data: {
            name: teamDetails.name,
            created_by_id: Number(userId),
            members: {
              create: {
                player_id: Number(userId),
                role: 'leader',
              },
            },
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing social action:", error);
    return NextResponse.json({ error: "Failed to process social action" }, { status: 500 });
  }
}

// Update challenge or team status
export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const {
      userId,
      actionId,
      action, // 'accept_friend', 'complete_challenge', 'update_team'
      status,
      teamUpdates,
    } = data;

    let result;

    switch (action) {
      case 'accept_friend':
        result = await prisma.friendship.update({
          where: { id: Number(actionId) },
          data: { status: 'accepted' },
        });
        break;

      case 'complete_challenge':
        result = await prisma.challenge.update({
          where: { id: Number(actionId) },
          data: {
            status: status,
            completed_at: new Date(),
          },
        });
        break;

      case 'update_team':
        result = await prisma.team.update({
          where: { id: Number(actionId) },
          data: teamUpdates,
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating social status:", error);
    return NextResponse.json({ error: "Failed to update social status" }, { status: 500 });
  }
} 
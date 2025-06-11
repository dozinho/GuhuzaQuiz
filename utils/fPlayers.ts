import prisma from "@/lib/prisma"

type milestoneType = {
    Milestone_Id: number,
    Milestone_Title: string,
    Milestone_description: string,
    UnlockingLevel: number,
    UploadRequired: boolean,
}

type levelType = {
    Level_Id: number,
    Level_Title: string,
    Level_number: number,
}

type completionType = {
    id: number,
    completionTime: number,
    score: number,
    completedAt: Date,
    Level_Id: number,
}

type playerType = {
    Player_ID: number,
    Player_name: string,
    Playerpoint: number,
    streak: number,
    lastLogin: Date,
    Level_Id?: number,
    Milestone_Id?: number,
    bestTime?: number,
    averageTime?: number,
    totalQuizzes: number,
    level?: levelType,
    milestone?: milestoneType,
    completions?: completionType[],
}

type Players = playerType[]

async function fetchPlayers() {
    try {
        const players = await prisma.player.findMany({
            include: {
                milestone: true,
                level: true,
                completions: {
                    orderBy: {
                        completedAt: 'desc'
                    }
                }
            },
            orderBy: [
                { Level_Id: 'desc' },
                { Playerpoint: 'desc' },
                { averageTime: 'asc' }
            ]
        });
        return players as Players;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export default fetchPlayers
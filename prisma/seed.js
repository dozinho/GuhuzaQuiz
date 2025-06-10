const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Helper function to get level category based on level number
function getLevelConfig(levelNumber) {
  if (levelNumber <= 10) {
    return {
      category: 'Beginner',
      difficultyBase: 1,
      title: 'The First Steps'
    };
  } else if (levelNumber <= 20) {
    return {
      category: 'Basic',
      difficultyBase: 2,
      title: 'Basic Understanding'
    };
  } else if (levelNumber <= 30) {
    return {
      category: 'Intermediate',
      difficultyBase: 3,
      title: 'Progressive Learning'
    };
  } else if (levelNumber <= 40) {
    return {
      category: 'Advanced',
      difficultyBase: 4,
      title: 'Advanced Mastery'
    };
  } else {
    return {
      category: 'Expert',
      difficultyBase: 5,
      title: 'Elite Challenge'
    };
  }
}

// Helper function to generate questions based on level
function generateQuestionsForLevel(levelConfig) {
  // Generate 10 questions for each level
  return Array.from({ length: 10 }, (_, index) => {
    const questionNumber = index + 1;
    const questionTypes = [
      "What is the correct answer for",
      "Choose the best option for",
      "Which of these applies to",
      "Select the most appropriate answer for",
      "What would be the result of",
      "Identify the correct solution for",
      "Which statement is true about",
      "What is the proper approach to",
      "Determine the best answer for",
      "What is the appropriate response to"
    ];

    return {
      question: `${questionTypes[index]} ${levelConfig.category} Question ${questionNumber}?`,
      answers: JSON.stringify([
        `The correct solution for Question ${questionNumber}`,
        `Alternative option ${questionNumber}.1`,
        `Alternative option ${questionNumber}.2`,
        `Alternative option ${questionNumber}.3`
      ]),
      test_answer: 0, // Correct answer is always first
      comment: `Explanation for ${levelConfig.category} Level Question ${questionNumber}`,
      difficulty: levelConfig.difficultyBase
    };
  });
}

async function main() {
  // Create 50 levels
  const levels = [];
  for (let i = 1; i <= 50; i++) {
    const levelConfig = getLevelConfig(i);

    const level = await prisma.level.create({
      data: {
        Level_Title: levelConfig.title,
        Level_number: i,
        questions: {
          create: generateQuestionsForLevel(levelConfig)
        }
      },
      include: {
        questions: true
      }
    });
    
    levels.push(level);
    console.log(`Created level ${i}: ${levelConfig.title}`);
  }

  // Create initial milestones
  const milestones = await Promise.all([
    prisma.milestone.create({
      data: {
        Milestone_Title: "First Steps",
        Milestone_description: "Begin your learning journey",
        UnlockingLevel: 1,
        Milestone_reward_message: "You've taken your first step into a larger world!",
        Milestone_Link: "/quiz/1",
        Milestone_Button_CTA: "Start Your Journey"
      }
    }),
    prisma.milestone.create({
      data: {
        Milestone_Title: "Rising Star",
        Milestone_description: "Complete your first 5 levels",
        UnlockingLevel: 5,
        Milestone_reward_message: "You're making excellent progress!",
        Milestone_Link: "/quiz/6",
        Milestone_Button_CTA: "Continue Learning"
      }
    })
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Helper function to generate random questions based on level
function generateQuestionsForLevel(levelId, difficulty) {
  const topics = [
    'History',
    'Science',
    'Geography',
    'Mathematics',
    'Literature',
    'Technology',
    'Sports',
    'Arts',
    'General Knowledge',
    'Current Affairs'
  ];

  const questionTemplates = [
    {
      template: "What is the capital of {X}?",
      answers: (x) => [
        `${x} City`, 
        `New ${x}`, 
        `${x}ville`, 
        `Port ${x}`
      ]
    },
    {
      template: "Who invented the {X}?",
      answers: (x) => [
        `Dr. ${x}`,
        `Professor ${x}`,
        `The ${x} Brothers`,
        `${x} Industries`
      ]
    },
    {
      template: "Which year did {X} occur?",
      answers: (x) => [
        `${1900 + Math.floor(Math.random() * 120)}`,
        `${1900 + Math.floor(Math.random() * 120)}`,
        `${1900 + Math.floor(Math.random() * 120)}`,
        `${1900 + Math.floor(Math.random() * 120)}`
      ]
    }
  ];

  // Generate 10 questions for each level
  return Array.from({ length: 10 }, (_, index) => {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const template = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    const question = template.template.replace('{X}', topic);
    const answers = template.answers(topic);
    const correctAnswer = Math.floor(Math.random() * 4); // Random correct answer index (0-3)
    
    // Make sure the correct answer is more sensible
    const temp = answers[0];
    answers[0] = answers[correctAnswer];
    answers[correctAnswer] = temp;

    return {
      question,
      answers: JSON.stringify(answers),
      test_answer: 0, // Now the correct answer is always at index 0
      comment: `This question tests your knowledge of ${topic.toLowerCase()}.`,
      difficulty: Math.min(Math.max(1, Math.floor(difficulty)), 5) // Ensure difficulty is between 1-5
    };
  });
}

async function main() {
  // Create 40 levels
  const levels = [];
  for (let i = 1; i <= 40; i++) {
    let levelTitle;
    if (i <= 10) {
      levelTitle = `Beginner Level ${i}`;
    } else if (i <= 20) {
      levelTitle = `Intermediate Level ${i}`;
    } else if (i <= 30) {
      levelTitle = `Advanced Level ${i}`;
    } else {
      levelTitle = `Expert Level ${i}`;
    }

    const level = await prisma.level.create({
      data: {
        Level_Title: levelTitle,
        Level_number: i,
        questions: {
          create: generateQuestionsForLevel(i, i/8)
        }
      },
      include: {
        questions: true
      }
    });
    
    levels.push(level);
  }

  // Create initial milestones
  const milestones = await Promise.all([
    prisma.milestone.create({
      data: {
        Milestone_Title: "First Quiz",
        Milestone_description: "Complete your first quiz",
        UnlockingLevel: 1,
        Milestone_reward_message: "Congratulations on completing your first quiz!",
        Milestone_Link: "/quiz/1",
        Milestone_Button_CTA: "Start Quiz"
      }
    }),
    prisma.milestone.create({
      data: {
        Milestone_Title: "Quiz Master",
        Milestone_description: "Complete 5 quizzes",
        UnlockingLevel: 2,
        Milestone_reward_message: "You're becoming a quiz master!",
        Milestone_Link: "/quiz/2",
        Milestone_Button_CTA: "Continue Journey"
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
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

// Helper function to generate diverse questions based on level
function generateQuestionsForLevel(levelConfig) {
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

  const topicTemplates = {
    'History': [
      {
        template: "In which year did {X} take place?",
        answers: (x) => [
          `${1700 + Math.floor(Math.random() * 300)}`,
          `${1700 + Math.floor(Math.random() * 300)}`,
          `${1700 + Math.floor(Math.random() * 300)}`,
          `${1700 + Math.floor(Math.random() * 300)}`
        ]
      },
      {
        template: "Who was the leader during {X}?",
        answers: (x) => ["Historical Figure A", "Historical Figure B", "Historical Figure C", "Historical Figure D"]
      }
    ],
    'Science': [
      {
        template: "What is the scientific principle behind {X}?",
        answers: (x) => ["Scientific Principle A", "Scientific Principle B", "Scientific Principle C", "Scientific Principle D"]
      },
      {
        template: "Which scientist discovered {X}?",
        answers: (x) => ["Scientist A", "Scientist B", "Scientist C", "Scientist D"]
      }
    ],
    'Geography': [
      {
        template: "What is the capital of {X}?",
        answers: (x) => [`${x} City`, `New ${x}`, `${x}ville`, `Port ${x}`]
      },
      {
        template: "Which continent is {X} located in?",
        answers: (x) => ["Asia", "Europe", "Africa", "Americas"]
      }
    ],
    'Mathematics': [
      {
        template: "What is the formula for {X}?",
        answers: (x) => ["Formula A", "Formula B", "Formula C", "Formula D"]
      },
      {
        template: "Solve the equation: {X}",
        answers: (x) => ["Solution A", "Solution B", "Solution C", "Solution D"]
      }
    ],
    'Literature': [
      {
        template: "Who wrote {X}?",
        answers: (x) => ["Author A", "Author B", "Author C", "Author D"]
      },
      {
        template: "What is the main theme of {X}?",
        answers: (x) => ["Theme A", "Theme B", "Theme C", "Theme D"]
      }
    ],
    'Technology': [
      {
        template: "When was {X} technology first introduced?",
        answers: (x) => [
          `${1950 + Math.floor(Math.random() * 70)}`,
          `${1950 + Math.floor(Math.random() * 70)}`,
          `${1950 + Math.floor(Math.random() * 70)}`,
          `${1950 + Math.floor(Math.random() * 70)}`
        ]
      },
      {
        template: "Who developed {X}?",
        answers: (x) => ["Tech Company A", "Tech Company B", "Tech Company C", "Tech Company D"]
      }
    ],
    'Sports': [
      {
        template: "Which team won the {X} championship in recent years?",
        answers: (x) => ["Team A", "Team B", "Team C", "Team D"]
      },
      {
        template: "Who holds the record for {X}?",
        answers: (x) => ["Athlete A", "Athlete B", "Athlete C", "Athlete D"]
      }
    ],
    'Arts': [
      {
        template: "Which artistic movement does {X} belong to?",
        answers: (x) => ["Movement A", "Movement B", "Movement C", "Movement D"]
      },
      {
        template: "Who created the artwork {X}?",
        answers: (x) => ["Artist A", "Artist B", "Artist C", "Artist D"]
      }
    ],
    'General Knowledge': [
      {
        template: "What is the significance of {X}?",
        answers: (x) => ["Significance A", "Significance B", "Significance C", "Significance D"]
      },
      {
        template: "Which category does {X} belong to?",
        answers: (x) => ["Category A", "Category B", "Category C", "Category D"]
      }
    ],
    'Current Affairs': [
      {
        template: "What recent development occurred regarding {X}?",
        answers: (x) => ["Development A", "Development B", "Development C", "Development D"]
      },
      {
        template: "Which policy change affected {X} recently?",
        answers: (x) => ["Policy A", "Policy B", "Policy C", "Policy D"]
      }
    ]
  };

  // Generate 10 questions for each level
  return Array.from({ length: 10 }, (_, index) => {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const templates = topicTemplates[topic];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const question = template.template.replace('{X}', topic);
    const answers = template.answers(topic);

    return {
      question,
      answers: JSON.stringify(answers),
      test_answer: 0,
      comment: `This question tests your knowledge of ${topic.toLowerCase()} at ${levelConfig.category} level.`,
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
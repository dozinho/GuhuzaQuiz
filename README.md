# GuhuzaQuiz - Interactive Learning Platform

An advanced quiz application built with Next.js, featuring progressive learning, real-time performance tracking, and interactive gameplay.

## Features

### Core Features
- **Progressive Learning System**: 50 levels across 5 difficulty tiers
- **Real-time Performance Tracking**: Track completion times, scores, and improvements
- **Interactive Quiz Interface**: Timer-based questions with sound effects
- **Achievement System**: Unlock badges and rewards
- **Leaderboard**: Real-time rankings and competition
- **Profile System**: Track personal progress and achievements

### Technical Features
- **Authentication**: Secure user authentication with NextAuth.js
- **Database Integration**: MySQL with Prisma ORM
- **Real-time Updates**: Live leaderboard and progress tracking
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimization**: Efficient data caching and state management

## Technologies Used

- **Frontend**: 
  - Next.js 14
  - React 18
  - TypeScript
  - Tailwind CSS
  - Framer Motion

- **Backend**:
  - MySQL
  - Prisma ORM
  - NextAuth.js

- **Additional Tools**:
  - date-fns
  - canvas-confetti
  - react-icons

## Prerequisites

- Node.js (v18 or higher)
- MySQL Server
- npm or yarn

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/GuhuzaQuiz.git
   cd GuhuzaQuiz
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/guhuza_quiz"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed the database
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
GuhuzaQuiz/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── context/          # React context providers
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── utils/                # Utility functions
```

## Key Features Implementation

### Quiz System
- Progressive difficulty levels
- Real-time scoring
- Timer-based questions
- Sound effects and animations

### Progress Tracking
- Individual statistics
- Performance metrics
- Achievement system
- Historical data

### User System
- Secure authentication
- Profile management
- Progress saving
- Achievement tracking

## Database Schema

The project uses a relational database with the following main models:
- Player
- Level
- Question
- LevelCompletion
- Milestone

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

### Traditional Hosting
1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Configure your web server (nginx/Apache) to proxy requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@guhuzaquiz.com or open an issue in the repository.

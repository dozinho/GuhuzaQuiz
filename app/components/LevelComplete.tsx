import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import Image from 'next/image';

interface LevelCompleteProps {
  score: number;
  totalScore: number;
  levelNumber: number;
  onContinue: () => void;
}

export default function LevelComplete({ score, totalScore, levelNumber, onContinue }: LevelCompleteProps) {
  useEffect(() => {
    // Play celebration sound
    const soundManager = (window as any).soundManager;
    if (soundManager) {
      soundManager.play('levelComplete');
      soundManager.play('achievement');
    }

    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      const particleCount = 50;

      // Launch confetti from both sides
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#4169E1']
      });
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#4169E1']
      });
    }, 250);

    return () => clearInterval(confettiInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 relative transform animate-scale-up shadow-2xl">
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
          <Image
            src="/mascot/celebrationMascot.svg"
            alt="Celebrating Mascot"
            width={150}
            height={150}
            className="animate-bounce-slow"
          />
        </div>

        <div className="text-center mt-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2 animate-scale-up">
            🎉 Congratulations! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-6 animate-fade-in">
            You've completed Level {levelNumber}!
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-yellow-50 rounded-lg p-4 animate-slide-up">
              <p className="text-lg text-yellow-700">Points Earned</p>
              <p className="text-3xl font-bold text-yellow-600">{score}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 animate-slide-up animation-delay-200">
              <p className="text-lg text-blue-700">Total Score</p>
              <p className="text-3xl font-bold text-blue-600">{totalScore}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={onContinue}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg
                       hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all
                       duration-200 font-medium shadow-lg animate-bounce-subtle"
            >
              Continue to Next Level
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
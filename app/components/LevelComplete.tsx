import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import Image from 'next/image';

interface LevelCompleteProps {
  score: number;
  totalScore: number;
  levelNumber: number;
  onContinue: () => void;
}

const celebratoryMessages = [
  "🌟 Outstanding Achievement! 🌟",
  "🎯 You're a Quiz Master! 🎯",
  "🚀 Incredible Performance! 🚀",
  "🏆 Level Conquered! 🏆",
  "⭐ You're Unstoppable! ⭐",
];

const motivationalQuotes = [
  "Keep pushing your limits!",
  "You're making incredible progress!",
  "Your dedication is paying off!",
  "Success looks good on you!",
  "You're on fire today!",
];

export default function LevelComplete({ score, totalScore, levelNumber, onContinue }: LevelCompleteProps) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    // Play celebration sounds
    const soundManager = (window as any).soundManager;
    if (soundManager) {
      soundManager.play('levelComplete');
      setTimeout(() => soundManager.play('achievement'), 500);
    }

    // Rotate through celebratory messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % celebratoryMessages.length);
    }, 2000);

    // Trigger confetti and fireworks animations
    const duration = 5000;
    const animationEnd = Date.now() + duration;

    const launchFireworks = () => {
      const particleCount = 50;
      const angleSpread = 60;
      const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#4169E1'];

      // Launch from multiple points
      [0.2, 0.8].forEach(x => {
        confetti({
          particleCount,
          angle: 90 + (Math.random() - 0.5) * angleSpread,
          spread: 60,
          origin: { x, y: 0.7 },
          colors,
          shapes: ['star', 'circle'],
          ticks: 200,
          scalar: 2,
        });
      });
    };

    // Initial fireworks
    launchFireworks();
    setShowFireworks(true);

    // Continuous fireworks
    const fireworksInterval = setInterval(() => {
      if (Date.now() < animationEnd) {
        launchFireworks();
      } else {
        clearInterval(fireworksInterval);
        setShowFireworks(false);
      }
    }, 700);

    return () => {
      clearInterval(messageInterval);
      clearInterval(fireworksInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 relative transform animate-scale-up shadow-2xl">
        {/* Floating stars animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Mascot */}
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
          {/* Main celebration message */}
          <h1 className="text-4xl font-bold text-blue-600 mb-2 animate-scale-up">
            {celebratoryMessages[currentMessage]}
          </h1>
          
          {/* Level completion message */}
          <p className="text-xl text-gray-600 mb-2 animate-fade-in">
            You've completed Level {levelNumber}!
          </p>
          
          {/* Motivational quote */}
          <p className="text-lg text-purple-600 mb-6 animate-fade-in italic">
            {motivationalQuotes[currentMessage]}
          </p>

          {/* Score display */}
          <div className="space-y-4 mb-8">
            <div className="bg-yellow-50 rounded-lg p-4 animate-slide-up relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-lg text-yellow-700">Points Earned</p>
                <p className="text-3xl font-bold text-yellow-600">{score}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-yellow-50 animate-shimmer" />
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 animate-slide-up animation-delay-200 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-lg text-blue-700">Total Score</p>
                <p className="text-3xl font-bold text-blue-600">{totalScore}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 animate-shimmer" />
            </div>
          </div>

          {/* Continue button */}
          <div className="flex justify-center gap-4">
            <button
              onClick={onContinue}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg
                       hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all
                       duration-200 font-medium shadow-lg animate-bounce-subtle relative group"
            >
              <span className="relative z-10">Continue to Next Level</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
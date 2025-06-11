"use client";
import React, { use, useState, useEffect, useRef } from "react";
import QuizCard from "./quizCard";
import { div } from "framer-motion/client";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import LeaderBoard from "./leaderBoard";
import { useContext } from "react";
import { playerContext } from "../context/playerContext";
import { setCookie } from "cookies-next";
import ShareButton from "./buttons/sharebtn";
import { useBadges } from "../context/badgeContext";
import BadgeSystem from "./badges/BadgeSystem";
import StarRating from './StarRating';

type quizeType = {
  question: string;
  comment: string;
  test_answer: number;
  answers: string[];
};

type LeaderboardPlayer = {
  Player_ID: number;
  Player_name: string;
  Playerpoint: number;
  Level_Id: number;
};

export default function QuizPageSection({ Quizes, levelNumber, levelTitle, player }: any) {


  const len = Quizes.length;
  const router = useRouter()
  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [ansCorrect, setAnsCorrect] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [retried, setRetried] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per question
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);
  const timeUpSoundRef = useRef<HTMLAudioElement | null>(null);
  var quizer: quizeType = Quizes[questionNumber];
  const [currentStreak, setCurrentStreak] = useState(0);
  const [answerTime, setAnswerTime] = useState(0);
  const { userBadges, checkAndAwardBadges, activePowerUps, activatePowerUp, usePowerUp } = useBadges();
  const [showBadgeNotification, setShowBadgeNotification] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(true);
  const [timerStarted, setTimerStarted] = useState(false);
  const [allQuestionsUnder5Seconds, setAllQuestionsUnder5Seconds] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>([]);
  const [averageTime, setAverageTime] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  // Initialize audio elements
  useEffect(() => {
    tickSoundRef.current = new Audio('/sounds/tick.mp3');
    timeUpSoundRef.current = new Audio('/sounds/timeup.mp3');
  }, []);

  // Timer effect
  useEffect(() => {
    if (!answerChecked && timeLeft > 0 && timerStarted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const timeSpent = 15 - prev;
          setAnswerTime(timeSpent); // Track time taken to answer
          if (prev > 1) {
            tickSoundRef.current?.play().catch(err => console.log('Error playing tick sound:', err));
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !answerChecked && timerStarted) {
      timeUpSoundRef.current?.play().catch(err => console.log('Error playing time up sound:', err));
      setAnswerChecked(true);
      setAnsCorrect(false);
    }
  }, [timeLeft, answerChecked, timerStarted]);

  // Check for power-ups
  useEffect(() => {
    const timeFreeze = activePowerUps.find(p => p.name === 'Time Freeze' && p.active);
    if (timeFreeze) {
      // Implement time freeze logic here
      usePowerUp('Time Freeze');
    }
  }, [activePowerUps]);

  // Reset timer when moving to next question
  useEffect(() => {
    setTimeLeft(15);
  }, [questionNumber]);

  const setDefault = () => {
    setSelectedAnswer(-1);
    setAnswerChecked(false);
    setAnsCorrect(false);
    setUsedHint(false);
    setRetried(false);
    setRetryCount(0);
  };

  const handleNextLevel = async () => {
    if (!player.Playerpoint) { 
      setCookie("tempScore", score)
      router.push("/")
    } else { 
      const nextLevel = Number(levelNumber) + 1
      const finalScore = score + player?.Playerpoint
      const playerId = player?.Player_ID
      const newlevel = Math.max(player.Level_Id, nextLevel)
      
      try {
        // First record the quiz completion
        const completionResponse = await fetch("/api/quiz-completion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            playerId, 
            levelId: Number(levelNumber),
            score: score,
            completionTime: totalTime // Send total time instead of average time
          }),
        });

        if (!completionResponse.ok) {
          throw new Error("Failed to record quiz completion");
        }

        // Then update the player's score
        const scoreResponse = await fetch("/api/updateScore", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ playerId, finalScore, newlevel }),
        });

        if (scoreResponse.ok) {
          const data = await scoreResponse.json();
          console.log("Score updated successfully!", data);
          router.push(`/quiz/${newlevel}`)
        } else {
          const errorData = await scoreResponse.json();
          console.error("Score update failed:", errorData.message);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  }

 

  const calculateScores = () => {
    const timeScore = Math.max(0, 100 - (averageTime * 5)); // Lower time is better
    const accuracyScore = (correctAnswers / totalAnswers) * 100 || 0;
    return { timeScore, accuracyScore };
  };

  const updateLeaderboard = async () => {
    try {
      setIsLeaderboardLoading(true);
      const response = await fetch('/api/leaderboard');
      const data: LeaderboardPlayer[] = await response.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(updateLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleScore = () => {
    setAnswerChecked(true);
    const isCorrect = selectedAnswer == quizer.test_answer;
    setTotalAnswers(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setCurrentStreak(prev => prev + 1);
      if (retried) {
        if (retryCount === 1) {
          setScore(score + 10);
        } else if (retryCount === 2) {
          setScore(score + 5);
        }
      } else {
        const doublePoints = activePowerUps.find(p => p.name === 'Double Points' && p.active);
        setScore(score + (doublePoints ? 60 : 30));
        if (doublePoints) {
          usePowerUp('Double Points');
        }
      }
    } else {
      setCurrentStreak(0);
    }

    // Update average time and total time
    setTotalTime(prev => prev + answerTime);
    setAverageTime(prev => {
      const newAvg = prev === 0 ? answerTime : (prev + answerTime) / 2;
      return newAvg;
    });

    // Update allQuestionsUnder5Seconds
    if (answerTime > 5) {
      setAllQuestionsUnder5Seconds(false);
    }

    // Check for badges
    checkAndAwardBadges({
      answerTime,
      isCorrect,
      score,
      streak: currentStreak,
      levelCompleted: questionNumber === len - 1,
      allQuestionsUnder5Seconds
    });
  };

  const handleShareScore = () => {
    const shareText = `🎮 I just completed Level ${levelNumber}: ${levelTitle} on Guhuza Quiz App! 🎯\n\n🏆 My score: ${score} points\n⭐ Total Score: ${player?.Playerpoint ? player?.Playerpoint + score : score} points\n\nCan you beat my score? Try it now! #GuhuzaQuiz #LearningIsFun`;
    return shareText;
  };

  const handleNextQuestion = () => {
    if (questionNumber < len) {
      setQuestionNumber(questionNumber + 1);
      setDefault();
    }
  };

  const handleRetry =() => { 
    setScore(0)
    setQuestionNumber(0)
    router.push("/quiz/"+ levelNumber)
    console.log("retried")

  }

  return questionNumber < len ? (
    <div className="md:py-16 pt-8 pb-28">
      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white p-8 rounded-xl max-w-2xl mx-4 relative shadow-2xl transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:rotate-90 transition-all duration-300"
              aria-label="Close instructions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-3 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Quiz Instructions</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">You have 15 seconds to answer each question</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">Correct answers earn you 30 points</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="font-medium">Retry Points:</p>
                </div>
                <ul className="list-disc pl-12 space-y-1">
                  <li>First retry: 10 points</li>
                  <li>Second retry: 5 points</li>
                </ul>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="font-medium">"Display Answer" shows the correct answer (no points awarded)</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p className="font-medium">Complete all questions to earn achievements and power-ups!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white p-8 rounded-xl max-w-2xl mx-4 relative shadow-2xl transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800">Quiz Instructions</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">You have 15 seconds to answer each question</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">Correct answers earn you 30 points</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="font-medium">Retry Points:</p>
                </div>
                <ul className="list-disc pl-12 space-y-1">
                  <li>First retry: 10 points</li>
                  <li>Second retry: 5 points</li>
                </ul>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="font-medium">"Display Answer" shows the correct answer (no points awarded)</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p className="font-medium">Complete all questions to earn achievements and power-ups!</p>
              </div>
            </div>
            <button 
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={() => {
                setShowRules(false);
                setTimerStarted(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Quiz
            </button>
          </div>
        </div>
      )}
      {/* Power-ups display */}
      {activePowerUps.length > 0 && (
        <div className="container mb-4">
          <div className="flex gap-4">
            {activePowerUps.map(powerUp => (
              <button
                key={powerUp.name}
                className={`px-4 py-2 rounded-lg ${
                  powerUp.active ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                onClick={() => activatePowerUp(powerUp.name)}
                disabled={powerUp.active || powerUp.remainingUses === 0}
              >
                {powerUp.name} ({powerUp.remainingUses} uses left)
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="container flex justify-between flex-wrap">
        <h2 className="md:mb-16 mb-4 title intersect: motion-preset-slide-up motion-delay-200 intersect-once">
          Level {levelNumber} : {levelTitle}
        </h2>
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
            <p className="text-sm text-blue-600">Current Points</p>
            <p className="text-2xl font-bold text-blue-700">{score}</p>
          </div>
          <p className="mb-6">
            Question : {questionNumber + 1}/{len}
          </p>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (timeLeft / 30) * 125.6}
                    className={`transition-all duration-1000 ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-500'}`}
                  />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                  {timeLeft}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInstructions(true)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg px-3 py-2 transition-colors duration-200 hover:scale-105 transform flex items-center gap-2"
              aria-label="Show instructions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Game Rules</span>
            </button>
          </div>
        </div>
      </div>
      <div className="container">
        <div className=" flex  justify-start md:gap-20  ">
          {
            <div className="flex-1">
              <QuizCard
                Question={quizer.question}
                CorrectAns={quizer.test_answer}
                Answers={quizer.answers}
                selectedAnswer={selectedAnswer}
                setSelectedAnswer={setSelectedAnswer}
                checked={answerChecked}
                setAnsCorrect={setAnsCorrect}
              />

              

              {/* buton section */}
              <div className=" ">
                <div className="mt-10 ">
                  {answerChecked ? (
                    <div className="w-full ">
                      {!ansCorrect ? (
                        <div>
                          <div className="flex gap-10">
                            <button
                              className="quizPbtn"
                              onClick={() => {
                                setSelectedAnswer(-1);
                                setAnswerChecked(false);
                                setRetried(true);
                                setRetryCount(prev => prev + 1);
                              }}
                              disabled={usedHint}
                            >
                              Retry
                            </button>
                            <button
                              className="quizSbtn"
                              onClick={() => {
                                setSelectedAnswer(quizer.test_answer);
                                setUsedHint(true);
                              }}
                            >
                              Display Answer
                            </button>
                          </div>
                          <p className="mt-6 text-sm absolute">
                            You can use Display Answer to force move to next
                            question without any point
                          </p>
                        </div>
                      ) : (
                        <div className="flex">
                          <button
                            className="quizPbtn ml-auto "
                            onClick={() => handleNextQuestion()}
                          >
                            {questionNumber < len - 1
                              ? "Next Question"
                              : "Finish Quiz"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      className="quizPbtn"
                      onClick={() => handleScore()}
                      disabled={selectedAnswer == -1 ? true : false}
                    >
                      Check Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          }
          <div className=" hidden md:block flex-1/2 w-100">
            {answerChecked ? (
              <div className="w-full ">
                {!ansCorrect ? (
                  <Image
                    src="/mascot/sadMascot.svg"
                    className="motion-preset-slide-left-md motion-preset-fade"
                    alt="Guhuza Mascot"
                    height={100}
                    width={200}
                  />
                ) : (
                  <Image
                    src="/mascot/greetingMascot.svg"
                    className="motion-preset-slide-left-md motion-preset-fade"
                    alt="Guhuza Mascot"
                    height={100}
                    width={200}
                  />
                )}
              </div>
            ) : (
              <Image
                className="motion-preset-slide-up-md motion-preset-fade"
                src="/mascot/proudMascot.svg"
                alt="Guhuza Mascot"
                height={100}
                width={200}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
 
    <div className="md:py-16 py-8">
      <div className="container">
        <div className="flex  flex-col items-center">
          <h1 className="title text-center">Lesson Complete !</h1>
          <div className="flex flex-wrap-reverse justify-center gap-8 items-center">
          <div className="flex  flex-col gap-8 mt-6 justify-center">
            <div className="bg-yellow-50 rounded border-2 border-yellow-300 gap-4 flex flex-col items-center px-6 py-4">
             
              <p className="mt-4 text-xl"> ⭐PTS GAINED</p>
              <h1 className="text-6xl font-bold">{score}</h1>
            </div>
            <div className="bg-blue-50 rounded border-2 border-blue-100   flex flex-col gap-4 items-center px-6 py-4">
            
              <p className="mt-4 text-xl"> 🏆TOTAL SCORE</p>
              <h1 className="text-6xl font-bold">{player?.Playerpoint ? player?.Playerpoint +  score: score}</h1>
            </div>
          </div>
          <Image src={"/mascot/proudMascot.svg"} className="mt-8" width={250} alt="Guhuza Bird" height={30} />

          </div>
          



         
          <div className="mt-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Level Performance</h2>
            <StarRating
              {...calculateScores()}
              totalStars={3}
            />
          </div>

          <div className="mt-12 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Live Leaderboard</h2>
              <button 
                onClick={updateLeaderboard}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLeaderboardLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLeaderboardLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading leaderboard...</span>
                          </div>
                        </td>
                      </tr>
                    ) : leaderboardData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      leaderboardData.map((playerData, index) => (
                        <tr 
                          key={playerData.Player_ID}
                          className={`${
                            playerData.Player_ID === player?.Player_ID 
                              ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                              : ''
                          } hover:bg-gray-50 transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`
                                ${index < 3 ? 'w-8 h-8 flex items-center justify-center rounded-full text-white font-bold' : 'text-gray-500'} 
                                ${index === 0 ? 'bg-yellow-400' : ''}
                                ${index === 1 ? 'bg-gray-400' : ''}
                                ${index === 2 ? 'bg-amber-600' : ''}
                              `}>
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {playerData.Player_name}
                                {playerData.Player_ID === player?.Player_ID && (
                                  <span className="ml-2 text-xs text-blue-600">(You)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {playerData.Playerpoint.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Level {playerData.Level_Id}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Your Achievements</h2>
            <BadgeSystem userBadges={userBadges} />
          </div>

          <button className="quizPbtn mt-20" onClick={handleNextLevel}>Save Score</button>

          <div className="flex  flex-wrap justify-center gap-6 mt-8">
            <button className="flex  gap-4" onClick={handleRetry}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Retry Same Lesson</button>
            <ShareButton 
              shareText={handleShareScore()}
              shareUrl={window.location.href}
              buttonClassName="flex gap-4 items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md"
            />
          </div>

        </div>
       
      </div>
    </div>
  );
}

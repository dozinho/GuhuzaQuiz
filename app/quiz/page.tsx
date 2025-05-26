import React from "react";
import Pbtn from "../components/buttons/primarybtn";
import Image from "next/image";
import WhyplaySection from "./whyplaySection";
import QuizLevelSections from "../components/quizLevelSections";
import LeaderBoard from "../components/leaderBoard";
import ProfileHerosection from "../components/profileHerosection";
import ShareButton from "../components/buttons/sharebtn";
import QuizHero from "../components/quizHero";
import fetchPlayers from "@/utils/fPlayers";
import { auth } from "@/auth";
import LogoutButton from "../components/buttons/logoutBtn";
import LoginButton from "../components/buttons/loginBtn";
import fetchUser from "@/utils/fUser";
import { cookies } from "next/headers";
async function QuizHomePage() {
  const players = (await fetchPlayers()) || [];
  const session = await auth();



  
  if (session) {
    const user = session.user;
    const name = user?.firstName == null ? "Anonymous" :user?.firstName 

    const player = await fetchUser(
      Number(user?.memberId),
      name,
      user?.email || ''
    );

    const playerLevel = player?.Level_Id ?? 1;
    return (
      <div className="mt-10">
        {/* Hero Section */}

        <QuizHero />

        {/* Why Play Section */}
        <div className="whyplay">
          <WhyplaySection />
        </div>

        {/* Quiz Level Section */}
        <div className="QuizSection mt-16">
          <QuizLevelSections playerLevel={playerLevel} />
        </div>

        {/* Leaderboard Section */}
        <div className="leaderboard section container">
          <LeaderBoard  />
        </div>

        {/* Share Button Section */}
        <div className="flex justify-center mt-8">
          <ShareButton />
        </div>
      </div>
    );
  }

  const playerLevel = 1
  return (
    <div className="mt-10">
    {/* Hero Section */}

    <QuizHero />

    {/* Why Play Section */}
    <div className="whyplay">
      <WhyplaySection />
    </div>

    {/* Quiz Level Section */}
    <div className="QuizSection mt-16">
      <QuizLevelSections playerLevel={playerLevel} />
    </div>

    {/* Leaderboard Section */}
    <div className="leaderboard section container">
      <LeaderBoard/>
    </div>
  </div>
  );
}

export default QuizHomePage;

"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black py-6 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div>
          <Link href="/quiz">
            <img src="/logo/logo_white_large.png" alt="Logo" className="h-10" />
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-4">
          <Link href="/quiz">
            <span className="text-white hover:underline">Quiz</span>
          </Link>
          <Link href="/progress">
            <span className="text-white hover:underline">Progress</span>
          </Link>
          <Link href="/">
            <span className="text-white hover:underline">Login</span>
          </Link>
          <Link href="/profile">
            <span className="text-white hover:underline">Profile</span>
          </Link>
          <a href="https://guhuza.com/" target="_blank" >
            <p className="text-white hover:underline flex justify-center gap-1 group">Guhuza <Image
                              src="/icons/AnotherWebsite.svg"
                              className="transition-transform duration-300  group-hover:rotate-12"
                              alt=""
                              width={20}
                              height={20}
                            /></p>
          </a>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu (Sliding Sidebar) */}
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-black transform transition-transform duration-300 ease-in-out z-50 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setIsMenuOpen(false)} className="text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation Links (Mobile) */}
          <div className="flex flex-col space-y-4 p-4 gap-8">
            <Link href="/quiz" className="w-full text-center">
              <span className="text-white hover:underline">Quiz</span>
            </Link>
            <Link href="/progress" className="w-full text-center">
              <span className="text-white hover:underline">Progress</span>
            </Link>
            <Link href="/" className="w-full text-center">
              <span className="text-white hover:underline">Login</span>
            </Link>
            
            <Link href="/profile" className="w-full text-center">
            <span className="text-white hover:underline">Profile</span>
          </Link>
          <a href="https://guhuza.com/" target="_blank" >
            <p className="text-white hover:underline flex justify-center gap-1 group">Guhuza <Image
                              src="/icons/AnotherWebsite.svg"
                              className="transition-transform duration-300  group-hover:rotate-12"
                              alt=""
                              width={20}
                              height={20}
                            /></p>
          </a>
          </div>
        </div>

        {/* Overlay for Mobile Menu */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </div>
    </header>
  );
}

export default Navbar;

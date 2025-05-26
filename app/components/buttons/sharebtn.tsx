import { useState, useRef, useEffect } from "react";
import {
  FaShareAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
} from "react-icons/fa";

const ShareButton = ({ score = 0 }: { score?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const websiteUrl = "https://guhuza.com/";
  const text = encodeURIComponent(
    `I just scored ${score}% on GuhuzaQuiz! 🧠💪 Try it out!`
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 quizSbtn"
      >
        <FaShareAlt /> Share
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="absolute top-12 right-0 bg-white shadow-lg rounded-lg p-3 w-48 z-10"
        >
          <p className="text-sm text-gray-700 mb-2">Share your score:</p>
          <div className="flex flex-col space-y-2">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${websiteUrl}&quote=${text}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-700 hover:underline"
            >
              <FaFacebook /> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${websiteUrl}&text=${text}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:underline"
            >
              <FaTwitter /> Twitter (X)
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <FaLinkedin /> LinkedIn
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${text} ${websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-600 hover:underline"
            >
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
// This component is a share button that allows users to share their quiz score on various social media platforms.
// It uses React hooks for state management and references, and includes icons from react-icons for visual appeal.
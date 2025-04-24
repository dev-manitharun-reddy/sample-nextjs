"use client";

import { useState } from "react";

const ContactButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleEmailClick = () => {
    const email = "dev.manitharunreddy@gmail.com";
    const subject = "Inquiry from DevMTR Website";
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoLink, "_blank");
  };

  return (
    <button
      onClick={handleEmailClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      aria-label="Contact via email"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>

      {isHovered && (
        <div className="absolute right-full mr-3 bg-white text-gray-800 py-2 px-4 rounded-lg shadow-md whitespace-nowrap">
          <p className="font-medium">Contact Us</p>
          <p className="text-sm text-gray-600">dev.manitharunreddy@gmail.com</p>
        </div>
      )}
    </button>
  );
};

export default ContactButton;

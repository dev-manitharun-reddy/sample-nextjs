"use client";

import Link from "next/link";
import Image from "next/image";
import ContactButton from "./(components)/ContactButton";

export default function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold text-blue-600 mb-4">
        404
      </h1>
      <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm sm:text-base">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-300 shadow-md text-sm sm:text-base"
        >
          Return Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300 shadow-md text-sm sm:text-base"
        >
          Go Back
        </button>
        <ContactButton />
      </div>
    </div>
  );
}

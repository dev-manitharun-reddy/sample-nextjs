"use client";

import Link from "next/link";

const Footer = () => {
  return (
    <footer className="max-h-20 bg-gray-900 text-white  py-2">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-semibold mb-2">
          <span className="animate-typing whitespace-nowrap overflow-hidden  pr-2">
            Connect with me on{" "}
            <span className="text-yellow-400">
              @dev.manitharunreddy@gmail.com
            </span>
          </span>
        </h2>

        <p className="text-sm text-gray-400">
          © 2023-2024{" "}
          <a
            href="https://hembdrpun.com.np/"
            target="_blank"
            className="underline hover:text-white"
          >
            dev-mtr
          </a>{" "}
          | All Rights Reserved |
        </p>
      </div>
    </footer>
  );
};

export default Footer;

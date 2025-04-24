"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Get logo URL and site name from environment variables or use defaults
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("userRole");

    setIsLoggedIn(loggedIn);
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserRole(null);
    // Redirect to home page
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 w-full bg-gradient-to-r from-blue-900 via-red-600 to-yellow-400 bg-[length:400%_400%] animate-gradient shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-105 transition-transform duration-300">
                <Image
                  src={logoUrl || ""}
                  alt="DevMTR Logo"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
              </div>
              <span className="ml-2 text-white font-bold text-xl">
                {siteName}
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn && userRole === "admin" && (
              <Link
                href="/admin/products"
                className={`text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium relative group ${
                  pathname === "/admin/products"
                    ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
                    : ""
                }`}
              >
                Products
              </Link>
            )}

            {isLoggedIn ? (
              <>
                {userRole === "admin" ? (
                  <Link
                    href="/admin/all-orders"
                    className={`text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium relative group ${
                      pathname === "/admin/all-orders"
                        ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
                        : ""
                    }`}
                  >
                    All Orders
                  </Link>
                ) : (
                  <Link
                    href="/my-orders"
                    className={`text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium relative group ${
                      pathname === "/my-orders"
                        ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
                        : ""
                    }`}
                  >
                    My Orders
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-white border border-white hover:bg-white hover:text-blue-900 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium relative group ${
                    pathname === "/login"
                      ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
                      : ""
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium relative group ${
                    pathname === "/register"
                      ? "after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
                      : ""
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden bg-gradient-to-r from-blue-900 via-red-600 to-yellow-400`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isLoggedIn && userRole === "admin" && (
            <Link
              href="/admin/products"
              className={`text-white block px-3 py-2 rounded-md text-base font-medium ${
                pathname === "/admin/products" ? "bg-white/10" : ""
              }`}
            >
              Products
            </Link>
          )}

          {isLoggedIn ? (
            <>
              {userRole === "admin" ? (
                <Link
                  href="/admin/all-orders"
                  className={`text-white block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === "/admin/all-orders" ? "bg-white/10" : ""
                  }`}
                >
                  All Orders
                </Link>
              ) : (
                <Link
                  href="/my-orders"
                  className={`text-white block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === "/my-orders" ? "bg-white/10" : ""
                  }`}
                >
                  My Orders
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-white border border-white hover:bg-white hover:text-blue-900 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-white block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/login" ? "bg-white/10" : ""
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`text-white block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === "/register" ? "bg-white/10" : ""
                }`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

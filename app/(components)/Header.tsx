"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const pathname = usePathname();

  // Get logo URL and site name from environment variables or use defaults
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

  // Function to load cart count from localStorage
  const loadCartCount = () => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          const totalItems = parsedCart.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          setCartItemCount(totalItems);
        }
      }
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  };

  // Load cart count on mount and set up storage event listener
  useEffect(() => {
    loadCartCount();

    // Listen for storage events to update cart count across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart") {
        loadCartCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Set up an interval to check for cart changes
    const intervalId = setInterval(loadCartCount, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 via-red-600 to-yellow-400 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Site Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
              ) : (
                <div className="w-10 h-10 bg-white rounded-full mr-2 flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-xl">D</span>
                </div>
              )}
              <span className="text-xl font-bold">
                {siteName || "DevMTR E-Commerce"}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn && user?.role === "admin" && (
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
                {user?.role === "admin" ? (
                  <Link
                    href="/admin/orders"
                    className={`text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium relative group ${
                      pathname === "/admin/orders"
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

                {/* Cart Icon for Customers */}
                {user?.role === "customer" && (
                  <Link
                    href="/cart"
                    className="text-white hover:text-white/80 px-3 py-2 rounded-md text-sm font-medium relative group flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Cart
                    {cartItemCount > 0 && (
                      <span className="ml-1 bg-white text-blue-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-white border border-white hover:bg-white hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
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
                  className="text-white border border-white hover:bg-white hover:text-blue-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:hidden bg-gradient-to-r from-blue-900 via-red-600 to-yellow-400`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isLoggedIn && user?.role === "admin" && (
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
              {user?.role === "admin" ? (
                <Link
                  href="/admin/orders"
                  className={`text-white block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === "/admin/orders" ? "bg-white/10" : ""
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

              {/* Cart Icon for Customers in Mobile Menu */}
              {user?.role === "customer" && (
                <Link
                  href="/cart"
                  className={`text-white block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    pathname === "/cart" ? "bg-white/10" : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Cart
                  {cartItemCount > 0 && (
                    <span className="ml-2 bg-white text-blue-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
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
                className="text-white border border-white hover:bg-white hover:text-blue-900 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300"
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

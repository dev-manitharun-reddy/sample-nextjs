"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    // Redirect if not logged in or not a customer
    if (!isLoggedIn || user?.role !== "customer") {
      router.push("/login");
    }
  }, [isLoggedIn, user, router]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been successfully placed
            and will be processed soon.
          </p>

          <div className="space-y-4">
            <Link
              href="/my-orders"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium"
            >
              View My Orders
            </Link>
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

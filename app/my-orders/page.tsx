"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  created_on: string | Date;
  update_on: string | Date;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in or not a customer
    if (!isLoggedIn || user?.role !== "customer") {
      router.push("/login");
      return;
    }

    // Fetch user's orders
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders?userId=${user?.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, user, router]);

  // Format date to a readable string
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Orders</h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Continue Shopping
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't placed any orders yet.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.created_on)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <Link
                        href={`/my-orders/${order._id}`}
                        className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Total: ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

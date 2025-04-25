"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { use } from "react";

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

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    // Redirect if not logged in or not a customer
    if (!isLoggedIn || user?.role !== "customer") {
      router.push("/login");
      return;
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${resolvedParams.orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch order");
        }

        // Verify that the order belongs to the current user
        if (data.userId !== user?.id) {
          router.push("/my-orders");
          return;
        }

        // Debug the date fields
        console.log("Order data from API:", data);
        console.log("Created on before conversion:", data.created_on);

        // Convert date strings to Date objects
        if (data.created_on) {
          // Check if it's already a Date object
          if (data.created_on instanceof Date) {
            console.log("Created on is already a Date object");
          } else {
            // Try to parse the date string
            const date = new Date(data.created_on);
            if (!isNaN(date.getTime())) {
              data.created_on = date;
              console.log("Created on after conversion:", data.created_on);
            } else {
              console.error("Invalid date format:", data.created_on);
              // Set a default date if the format is invalid
              data.created_on = new Date();
            }
          }
        } else {
          console.log("No created_on date found in the order data");
          // Set a default date if none exists
          data.created_on = new Date();
        }

        if (data.update_on) {
          if (data.update_on instanceof Date) {
            console.log("Update on is already a Date object");
          } else {
            const date = new Date(data.update_on);
            if (!isNaN(date.getTime())) {
              data.update_on = date;
              console.log("Update on after conversion:", data.update_on);
            } else {
              console.error("Invalid date format:", data.update_on);
              data.update_on = new Date();
            }
          }
        } else {
          console.log("No update_on date found in the order data");
          data.update_on = new Date();
        }

        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load order details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [isLoggedIn, user, router, resolvedParams.orderId]);

  // Format date to a readable string
  const formatDate = (date: string | Date | undefined) => {
    if (!date) {
      console.log("formatDate called with undefined date");
      return "N/A";
    }

    try {
      console.log("Formatting date:", date, "Type:", typeof date);

      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === "string") {
        dateObj = new Date(date);
      } else {
        console.error("Unexpected date type:", typeof date);
        return "Invalid Date Format";
      }

      if (isNaN(dateObj.getTime())) {
        console.error("Invalid date value:", date);
        return "Invalid Date";
      }

      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      console.log("Formatted date:", formattedDate);
      return formattedDate;
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {error || "Order not found"}
              </h3>
              <div className="mt-6">
                <Link
                  href="/my-orders"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to My Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-sm text-gray-500">
                Order #{order._id.slice(-6).toUpperCase()}
              </p>
            </div>
            <Link
              href="/my-orders"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to My Orders
            </Link>
          </div>

          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Order Status
                </h2>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(order.created_on)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900">
                {order.shippingAddress.street}
              </p>
              <p className="text-sm text-gray-900">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </p>
              <p className="text-sm text-gray-900">
                {order.shippingAddress.country}
              </p>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${order.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

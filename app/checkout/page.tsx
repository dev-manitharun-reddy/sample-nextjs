"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    shippingAddress: ShippingAddress;
  }>({
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  useEffect(() => {
    // Redirect if not logged in or not a customer
    if (!isLoggedIn || user?.role !== "customer") {
      router.push("/login");
      return;
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          setCart(parsedCart);
        } else {
          router.push("/cart");
        }
      } catch (error) {
        console.error("Error loading cart:", error);
        router.push("/cart");
      }
    } else {
      router.push("/cart");
    }
    setLoading(false);
  }, [isLoggedIn, user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("shippingAddress.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value,
        },
      }));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Debug logging
      console.log("User:", user);
      console.log("Cart:", cart);
      console.log("Shipping Address:", formData.shippingAddress);

      if (!user?.id) {
        throw new Error("User ID is missing. Please log in again.");
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          shippingAddress: formData.shippingAddress,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      // Clear cart from localStorage
      localStorage.removeItem("cart");

      // Redirect to order confirmation page
      router.push("/order-confirmation");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setSubmitting(false);
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
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.street"
                    value={formData.shippingAddress.street}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.city"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.state"
                    value={formData.shippingAddress.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.zipCode"
                    value={formData.shippingAddress.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.country"
                    value={formData.shippingAddress.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex justify-between items-center pt-6">
              <Link href="/cart" className="text-blue-600 hover:text-blue-800">
                ← Back to Cart
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

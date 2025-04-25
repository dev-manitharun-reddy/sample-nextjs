"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export default function CartPage() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage
  const loadCart = () => {
    try {
      // Force a fresh read from localStorage
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          // Only update the cart if it's different from the current cart
          setCart((prevCart) => {
            // Check if the carts are different
            const isDifferent =
              JSON.stringify(prevCart) !== JSON.stringify(parsedCart);
            return isDifferent ? parsedCart : prevCart;
          });
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect non-customer users
    if (isLoggedIn && user?.role !== "customer") {
      router.push("/");
      return;
    }

    // Load cart immediately
    loadCart();

    // Also set up an interval to check for cart changes
    const intervalId = setInterval(loadCart, 1000);

    return () => clearInterval(intervalId);
  }, [isLoggedIn, user, router]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else if (cart.length === 0 && localStorage.getItem("cart")) {
      // Only remove from localStorage if it exists and our cart is empty
      localStorage.removeItem("cart");
    }
  }, [cart]);

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.productId !== productId)
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
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
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {cart && cart.length === 0 ? (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400 mb-4"
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
              <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
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
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <p className="text-gray-600">${item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateCartItemQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-6">
                <div>
                  <p className="text-gray-600">Subtotal:</p>
                  <p className="text-2xl font-bold">
                    ${getCartTotal().toFixed(2)}
                  </p>
                </div>
                {isLoggedIn ? (
                  <Link
                    href="/checkout"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium"
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium"
                  >
                    Login to Checkout
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

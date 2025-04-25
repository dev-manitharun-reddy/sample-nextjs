"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";

interface Product {
  _id: string;
  name: string;
  actualPrice: number;
  finalPrice: number;
  imageUrl: string;
  status: string;
  sellable: boolean;
}

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "none">(
    "none"
  );

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        // Show all products regardless of status
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products when search query or sort option changes
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy !== "none") {
      result.sort((a, b) => {
        if (sortBy === "price-asc") {
          return a.finalPrice - b.finalPrice;
        } else {
          return b.finalPrice - a.finalPrice;
        }
      });
    }

    setFilteredProducts(result);
  }, [products, searchQuery, sortBy]);

  const addToCart = (product: Product) => {
    if (!isLoggedIn) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      // Get current cart from localStorage
      const savedCart = localStorage.getItem("cart");
      let cart = savedCart ? JSON.parse(savedCart) : [];

      // Check if product already exists in cart
      const existingItemIndex = cart.findIndex(
        (item: any) => item.productId === product._id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if product exists
        cart[existingItemIndex].quantity += 1;
      } else {
        // Add new item if product doesn't exist
        cart.push({
          productId: product._id,
          name: product.name,
          price: product.finalPrice,
          quantity: 1,
          imageUrl: product.imageUrl,
        });
      }

      // Save updated cart to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Show success message
      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "price-asc" | "price-desc" | "none");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">
                No products found matching your search.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full pt-[75%]">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                  {!product.sellable && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      Not Available
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 line-through">
                      ${product.actualPrice}
                    </span>
                    <span className="text-green-600 font-bold">
                      ${product.finalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        product.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : product.status === "Out of Stock"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  {product.sellable ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 rounded cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

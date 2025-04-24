"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

interface Product {
  _id: string;
  name: string;
  actualPrice: number;
  finalPrice: number;
  imageUrl: string;
  status: string;
  sellable: boolean;
}

const AdminProductsPage = () => {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: "all",
    sellable: "all",
    search: "",
  });

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/");
      return;
    }
    fetchProducts();
  }, [isLoggedIn, user, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter((product) => product._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesStatus =
      filter.status === "all" || product.status === filter.status;
    const matchesSellable =
      filter.sellable === "all" ||
      (filter.sellable === "true" && product.sellable) ||
      (filter.sellable === "false" && !product.sellable);
    const matchesSearch = product.name
      .toLowerCase()
      .includes(filter.search.toLowerCase());
    return matchesStatus && matchesSellable && matchesSearch;
  });

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
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Products Management
            </h1>
            <Link
              href="/admin/products/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Product
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Upcoming">Upcoming</option>
              <option value="OutOfStock">Out of Stock</option>
            </select>
            <select
              value={filter.sellable}
              onChange={(e) =>
                setFilter({ ...filter, sellable: e.target.value })
              }
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Products</option>
              <option value="true">Sellable</option>
              <option value="false">Not Sellable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="overflow-y-auto max-h-[calc(100vh-10rem)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
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
                </div>
                <div className="p-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-gray-600">Actual Price:</span>
                    <span className="font-medium">${product.actualPrice}</span>
                  </div>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-gray-600">Final Price:</span>
                    <span className="font-medium text-green-600">
                      ${product.finalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        product.status === "Available"
                          ? "bg-green-100 text-green-800"
                          : product.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Sellable:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        product.sellable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.sellable ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2 text-sm">
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    {/* <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;

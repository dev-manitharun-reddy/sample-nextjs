"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Link from "next/link";
import { use } from "react";

interface Product {
  _id: string;
  name: string;
  actualPrice: number;
  finalPrice: number;
  imageUrl: string;
  status: "Available" | "Upcoming" | "OutOfStock";
  sellable: boolean;
}

interface ProductFormData {
  name: string;
  actualPrice: string;
  finalPrice: string;
  imageUrl: string;
  status: "Available" | "Upcoming" | "OutOfStock";
  sellable: boolean;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    actualPrice: "",
    finalPrice: "",
    imageUrl: "",
    status: "Available",
    sellable: true,
  });

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const product: Product = await response.json();
        setFormData({
          name: product.name,
          actualPrice: product.actualPrice.toString(),
          finalPrice: product.finalPrice.toString(),
          imageUrl: product.imageUrl,
          status: product.status,
          sellable: product.sellable,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isLoggedIn, user, router, productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate final price is not greater than actual price
    if (parseFloat(formData.finalPrice) > parseFloat(formData.actualPrice)) {
      setError("Final price cannot be greater than actual price");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          actualPrice: parseFloat(formData.actualPrice),
          finalPrice: parseFloat(formData.finalPrice),
          imageUrl: formData.imageUrl,
          status: formData.status,
          sellable: formData.sellable,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Product
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="actualPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Actual Price
                </label>
                <input
                  type="number"
                  id="actualPrice"
                  name="actualPrice"
                  value={formData.actualPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="finalPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Final Price
                </label>
                <input
                  type="number"
                  id="finalPrice"
                  name="finalPrice"
                  value={formData.finalPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Upcoming">Upcoming</option>
                <option value="OutOfStock">Out of Stock</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sellable"
                name="sellable"
                checked={formData.sellable}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="sellable"
                className="ml-2 block text-sm text-gray-700"
              >
                Sellable
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Link
                href="/admin/products"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

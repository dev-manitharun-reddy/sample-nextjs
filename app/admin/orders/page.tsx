"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

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
  created_on: string;
  update_on: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

// Status badge component
const StatusBadge = ({ status }: { status: Order["status"] }) => {
  const getStatusColor = (status: Order["status"]) => {
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

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

const AdminOrdersPage = () => {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: "all",
    search: "",
  });

  // Add clearError function
  const clearError = () => {
    setError(null);
  };

  // Calculate order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "Pending").length,
    processing: orders.filter((order) => order.status === "Processing").length,
    shipped: orders.filter((order) => order.status === "Shipped").length,
    delivered: orders.filter((order) => order.status === "Delivered").length,
    cancelled: orders.filter((order) => order.status === "Cancelled").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  };

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/");
      return;
    }
    fetchOrders();
  }, [isLoggedIn, user, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/all", {
        headers: {
          Authorization: `Bearer ${user?.id || ""}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const order = orders.find((o) => o._id === orderId);
      if (!order) {
        setError("Order not found");
        return;
      }

      // Validate status
      const validStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];
      if (!validStatuses.includes(newStatus)) {
        setError("Invalid status");
        return;
      }

      const response = await fetch("/api/orders/all", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || ""}`,
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();
      if (!updatedOrder) {
        throw new Error("No response data received");
      }

      setOrders(
        orders.map((order) => (order._id === orderId ? updatedOrder : order))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleQuantityChange = async (
    orderId: string,
    productId: string,
    newQuantity: number
  ) => {
    try {
      const order = orders.find((o) => o._id === orderId);
      if (!order) {
        setError("Order not found");
        return;
      }

      // Check if the product exists in the order
      const productExists = order.items.some(
        (item) => item.productId === productId
      );
      if (!productExists) {
        setError("Product not found in order");
        return;
      }

      // Validate quantity
      if (newQuantity < 1) {
        setError("Quantity must be at least 1");
        return;
      }

      // Create a new order object with updated items
      const updatedOrder = {
        ...order,
        items: order.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      };

      const response = await fetch("/api/orders/all", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || ""}`,
        },
        body: JSON.stringify({
          orderId,
          items: updatedOrder.items,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const responseData = await response.json();
      if (!responseData) {
        throw new Error("No response data received");
      }

      // Update the orders state with the new data
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: responseData.items,
                totalAmount: responseData.totalAmount,
              }
            : order
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update quantity"
      );
    }
  };

  const handleDeleteProduct = async (orderId: string, productId: string) => {
    try {
      const order = orders.find((o) => o._id === orderId);
      if (!order) {
        setError("Order not found");
        return;
      }

      // Check if the product exists in the order
      const productExists = order.items.some(
        (item) => item.productId === productId
      );
      if (!productExists) {
        setError("Product not found in order");
        return;
      }

      const updatedItems = order.items.filter(
        (item) => item.productId !== productId
      );

      // Don't allow deleting all items from an order
      if (updatedItems.length === 0) {
        setError(
          "Cannot delete all items from an order. Please delete the entire order instead."
        );
        return;
      }

      const response = await fetch("/api/orders/all", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.id || ""}`,
        },
        body: JSON.stringify({
          orderId,
          items: updatedItems,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      const responseData = await response.json();
      if (!responseData) {
        throw new Error("No response data received");
      }

      // Update the orders state with the new data while preserving user information
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: responseData.items,
                totalAmount: responseData.totalAmount,
              }
            : order
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/all?orderId=${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.id || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      setOrders(orders.filter((order) => order._id !== orderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filter.status === "all" || order.status === filter.status;
    const matchesSearch =
      filter.search === "" ||
      order.user?.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(filter.search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Orders
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              clearError();
              fetchOrders();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Orders Management
          </h1>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by customer name or email..."
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Order Statistics */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${orderStats.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Delivered Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.delivered}
                </p>
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order._id.slice(-6)}
                      </h3>
                      <div className="flex items-center mt-1">
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-gray-600 mt-1">
                        Customer: {order.user.name} ({order.user.email})
                      </p>
                      <p className="text-gray-600">
                        Date: {new Date(order.created_on).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            e.target.value as Order["status"]
                          )
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg
                          className="h-4 w-4 mr-1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Delete Order
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                        >
                          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {item.name}
                              </h4>
                              <p className="text-gray-600">
                                ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <label
                                htmlFor={`quantity-${item.productId}`}
                                className="sr-only"
                              >
                                Quantity
                              </label>
                              <input
                                id={`quantity-${item.productId}`}
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    order._id,
                                    item.productId,
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteProduct(order._id, item.productId)
                              }
                              className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg
                                className="h-4 w-4 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
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
  );
};

export default AdminOrdersPage;

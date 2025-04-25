import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { User } from "@/models/User";

// GET /api/orders/all - Get all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    // Check if the request is from an admin
    if (!authHeader || !authHeader.includes("Bearer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Verify that the user is an admin
    const user = await User.findById(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all orders and populate user information
    const orders = await Order.find({}).sort({ created_on: -1 });

    // Get user information for each order
    const ordersWithUserInfo = await Promise.all(
      orders.map(async (order) => {
        try {
          // Fetch user information from the users collection
          const user = await mongoose.connection
            .collection("users")
            .findOne(
              { _id: new ObjectId(order.userId) },
              { projection: { name: 1, email: 1 } }
            );

          return {
            ...order.toObject(),
            user: user
              ? {
                  _id: user._id.toString(),
                  name: user.name || "Unknown User",
                  email: user.email || "No email",
                }
              : {
                  _id: order.userId,
                  name: "Unknown User",
                  email: "No email",
                },
          };
        } catch (error) {
          console.error(`Error fetching user for order ${order._id}:`, error);
          return {
            ...order.toObject(),
            user: {
              _id: order.userId,
              name: "Unknown User",
              email: "No email",
            },
          };
        }
      })
    );

    return NextResponse.json(ordersWithUserInfo);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/all - Update order status (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    // Check if the request is from an admin
    if (!authHeader || !authHeader.includes("Bearer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Verify that the user is an admin
    const user = await User.findById(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status, items } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order fields if provided
    if (status) order.status = status;
    if (items) {
      order.items = items;
      // Recalculate total amount
      order.totalAmount = items.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0
      );
    }

    await order.save();
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/all - Delete order (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    // Check if the request is from an admin
    if (!authHeader || !authHeader.includes("Bearer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract user ID from the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Verify that the user is an admin
    const user = await User.findById(token);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

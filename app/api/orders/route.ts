import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Order } from "@/models/Order";

// GET /api/orders - Get all orders (for admin) or user's orders (for customer)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const orders = await Order.find({ userId }).sort({ created_on: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    console.log("Received order data:", JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.userId || !body.items || !body.shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = body.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create order with explicit status and default payment method
    const orderData = {
      userId: body.userId,
      items: body.items,
      totalAmount,
      status: "Pending", // Explicitly set status
      shippingAddress: body.shippingAddress,
      paymentMethod: "Credit Card", // Add default payment method
      created_on: new Date(),
      update_on: new Date(),
    };

    console.log(
      "Creating order with data:",
      JSON.stringify(orderData, null, 2)
    );

    const order = await Order.create(orderData);
    console.log("Order created successfully:", order._id);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);

    // Log detailed error information
    if (error.errors) {
      console.error(
        "Validation errors:",
        JSON.stringify(error.errors, null, 2)
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

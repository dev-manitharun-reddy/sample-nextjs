import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const mongoose = await connectDB();
    const orderId = params.orderId;

    // Validate orderId format
    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    // Find the order by ID
    const order = await mongoose.connection.collection("orders").findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

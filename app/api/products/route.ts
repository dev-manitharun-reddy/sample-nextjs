import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Product } from "@/models/Product";

// GET /api/products - Get all products
export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ created_on: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.actualPrice || !body.finalPrice || !body.imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate prices
    if (body.finalPrice > body.actualPrice) {
      return NextResponse.json(
        { error: "Final price cannot be greater than actual price" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      ...body,
      created_on: new Date(),
      update_on: new Date(),
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

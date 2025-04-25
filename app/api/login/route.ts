import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called");

    // Connect to the database
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connection established");

    // Parse the request body
    const body = await request.json();
    const { phone, password } = body;
    console.log(`Login attempt for phone: ${phone}`);

    // Validate required fields
    if (!phone || !password) {
      console.log("Login failed: Missing phone or password");
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 }
      );
    }

    // Find user by phone number
    console.log("Finding user by phone number...");
    const user = await User.findOne({ phone });

    if (!user) {
      console.log(`Login failed: User with phone ${phone} not found`);
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Check if password matches
    if (user.password !== password) {
      console.log(
        `Login failed: Invalid password for user with phone ${phone}`
      );
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 1) {
      console.log(`Login failed: User with phone ${phone} is not active`);
      return NextResponse.json(
        { error: "Your account is not active. Please contact support." },
        { status: 403 }
      );
    }

    console.log(`User ${user._id} logged in successfully`);

    // Return user info (excluding password)
    return NextResponse.json({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || "customer",
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

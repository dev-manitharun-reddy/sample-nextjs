import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    console.log("Registration API called");

    // Connect to the database
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connection established");

    // Parse the request body
    const body = await request.json();
    const { name, email, password, phone } = body;
    console.log(`Registration attempt for phone: ${phone}`);

    // Validate phone number (only mandatory field)
    if (!phone) {
      console.log("Registration failed: Phone number missing");
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Check if user with this phone already exists
    console.log("Checking if user already exists...");
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.log(
        `Registration failed: User with phone ${phone} already exists`
      );
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 409 }
      );
    }

    // Create new user
    console.log("Creating new user...");
    const newUser = new User({
      name: name || "",
      email: email || "",
      password: password || "",
      phone,
      role: "customer", // Default role
      created_on: new Date(),
      update_on: new Date(),
      status: 1,
    });

    // Save user to database
    console.log("Saving user to database...");
    await newUser.save();
    console.log(`User registered successfully with ID: ${newUser._id}`);

    // Return success response
    return NextResponse.json(
      { message: "User registered successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}

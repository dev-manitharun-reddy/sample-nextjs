import mongoose from "mongoose";

// Define the User interface
export interface User {
  name?: string;
  email?: string;
  password?: string;
  phone: string;
  role: string;
  created_on: Date;
  update_on: Date;
  status: number;
}

// Create the User schema
const userSchema = new mongoose.Schema<User>({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  phone: { type: String, required: true },
  role: { type: String, default: "customer" },
  created_on: { type: Date, default: Date.now },
  update_on: { type: Date, default: Date.now },
  status: { type: Number, default: 1 },
});

// Create and export the model
export const User =
  mongoose.models.User || mongoose.model<User>("User", userSchema);

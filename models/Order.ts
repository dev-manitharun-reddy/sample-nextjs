import mongoose from "mongoose";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
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
  created_on: Date;
  update_on: Date;
}

const orderSchema = new mongoose.Schema<Order>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    items: [
      {
        productId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        imageUrl: {
          type: String,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, "Street address is required"],
      },
      city: {
        type: String,
        required: [true, "City is required"],
      },
      state: {
        type: String,
        required: [true, "State is required"],
      },
      zipCode: {
        type: String,
        required: [true, "ZIP code is required"],
      },
      country: {
        type: String,
        required: [true, "Country is required"],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ created_on: -1 });

// Create the model if it doesn't exist, otherwise use the existing one
const Order =
  mongoose.models.Order || mongoose.model<Order>("Order", orderSchema);

export { Order };

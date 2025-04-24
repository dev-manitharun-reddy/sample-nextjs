import mongoose from "mongoose";

export interface IProduct {
  name: string;
  actualPrice: number;
  finalPrice: number;
  imageUrl: string;
  status: "Available" | "Upcoming" | "OutOfStock";
  sellable: boolean;
  created_on: Date;
  update_on: Date;
}

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    actualPrice: {
      type: Number,
      required: [true, "Actual price is required"],
      min: [0, "Price cannot be negative"],
    },
    finalPrice: {
      type: Number,
      required: [true, "Final price is required"],
      min: [0, "Price cannot be negative"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Available", "Upcoming", "OutOfStock"],
      default: "Available",
    },
    sellable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
productSchema.index({ name: "text" });
productSchema.index({ status: 1 });
productSchema.index({ sellable: 1 });

// Add a pre-save middleware to validate that finalPrice is not greater than actualPrice
productSchema.pre("save", function (next) {
  if (this.finalPrice > this.actualPrice) {
    next(new Error("Final price cannot be greater than actual price"));
  }
  next();
});

// Create the model if it doesn't exist, otherwise use the existing one
const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export { Product };

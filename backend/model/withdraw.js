const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId, // Changed to reference Seller model
    ref: "Seller", // Assuming you have a Seller model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount cannot be negative"], // Validation to prevent negative amounts
  },
  status: {
    type: String,
    enum: ["Processing", "Approved", "Rejected", "Completed", "Failed"], // Defined possible statuses
    default: "Processing",
  },
  paymentMethod: { // Added to track how the withdrawal is processed
    type: String,
    enum: ["eSewa", "Bank Transfer", "Other"], // Example methods, adjust as needed
    default: "eSewa", // Default to eSewa if integrating with it
  },
  paymentDetails: { // Added to store payment-specific info
    transactionId: { // eSewa transaction ID or bank transaction ID
      type: String,
    },
    accountDetails: { // For bank transfers or eSewa wallet info
      type: String,
    },
    status: { // Payment gateway status (e.g., from eSewa status check)
      type: String,
      enum: ["PENDING", "COMPLETE", "FAILED", "REFUNDED", null],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Set default to track creation time initially
  },
  completedAt: { // Added to track when withdrawal is fully processed
    type: Date,
  },
  reason: { // Added to store reason for rejection or failure
    type: String,
  },
});

// Middleware to update `updatedAt` on every update
withdrawSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  if (this.status === "Completed" && !this.completedAt) {
    this.completedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model("Withdraw", withdrawSchema);
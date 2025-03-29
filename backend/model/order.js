const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  cart: {
    type: Array,
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    type: Object, // Consider using a reference to a User model if applicable
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  subTotalPrice: { // Added to store subtotal before shipping/discount
    type: Number,
    required: true,
  },
  shipping: { // Added to store shipping cost
    type: Number,
    required: true,
  },
  discountPrice: { // Added to store discount amount
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "Processing", // Order processing status (e.g., Processing, Shipped, Delivered)
  },
  paymentInfo: {
    id: {
      type: String, // eSewa transaction_uuid
    },
    status: {
      type: String, // eSewa payment status (e.g., PENDING, COMPLETE, FAILED)
      default: "PENDING",
    },
    type: {
      type: String, // Payment method (e.g., "eSewa")
      default: "eSewa",
    },
    refId: { // Added to store eSewa reference ID (ref_id) from status check or response
      type: String,
    },
    signature: { // Added to store the signature received from eSewa for verification
      type: String,
    },
  },
  paidAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
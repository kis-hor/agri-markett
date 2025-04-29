const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "unread",
    enum: ["read", "unread", "archived"],
  },
  type: {
    type: String,
    required: true,
    enum: ["order", "order_update", "product", "offer", "payment", "system", "message", "promotion", "wishlist", "restock"],
  },
  image: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  shopId: {
    type: String,
  },
  clickAction: {
    type: String,
  },
  senderId: {
    type: String,
  },
  conversationId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
})

// Indexes for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ shopId: 1, createdAt: -1 })
notificationSchema.index({ status: 1, createdAt: -1 })
notificationSchema.index({ type: 1, createdAt: -1 })

// Add method to check if notification is expired
notificationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date()
}

module.exports = mongoose.model("Notification", notificationSchema)

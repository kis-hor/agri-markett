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
    enum: ["read", "unread"],
  },
  type: {
    type: String,
    required: true,
    enum: ["order", "product", "offer", "payment", "system"],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model("Notification", notificationSchema)

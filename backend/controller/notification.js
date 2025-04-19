const express = require("express")
const router = express.Router()
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const ErrorHandler = require("../utils/ErrorHandler")
const { isAuthenticated, isAdmin } = require("../middleware/auth")
const Notification = require("../model/notification")

// Create a new notification
router.post(
  "/create-notification",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { title, message, userId, type, image, shopId, clickAction } = req.body

      if (!title || !message || !userId || !type) {
        return next(new ErrorHandler("Please provide all required fields", 400))
      }

      const notification = await Notification.create({
        title,
        message,
        userId,
        type,
        image,
        shopId,
        clickAction,
      })

      // Emit socket event if socket.io is available
      if (req.app.get("io")) {
        req.app.get("io").to(userId).emit("new-notification", notification)
      }

      res.status(201).json({
        success: true,
        notification,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// Get all notifications for a user
router.get(
  "/get-all-notifications",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50)

      res.status(200).json({
        success: true,
        notifications,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// Mark notification as read
router.put(
  "/mark-as-read/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findById(req.params.id)

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404))
      }

      // Check if the notification belongs to the user
      if (notification.userId !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to update this notification", 403))
      }

      notification.status = "read"
      await notification.save()

      res.status(200).json({
        success: true,
        notification,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// Mark all notifications as read
router.put(
  "/mark-all-as-read",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      await Notification.updateMany({ userId: req.user.id, status: "unread" }, { status: "read" })

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// Delete a notification
router.delete(
  "/delete-notification/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findById(req.params.id)

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404))
      }

      // Check if the notification belongs to the user
      if (notification.userId !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to delete this notification", 403))
      }

      await notification.remove()

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// Get unread notification count
router.get(
  "/unread-count",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const count = await Notification.countDocuments({ userId: req.user.id, status: "unread" })

      res.status(200).json({
        success: true,
        count,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

module.exports = router

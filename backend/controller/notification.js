const express = require("express")
const router = express.Router()
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const ErrorHandler = require("../utils/ErrorHandler")
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth")
const Notification = require("../model/notification")

// Create a new notification
router.post(
  "/create-notification",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { title, message, userId, type, shopId, clickAction, senderId, conversationId } = req.body

      // Validate required fields
      if (!title || !message || !userId || !type) {
        return next(new ErrorHandler("Please provide all required fields", 400))
      }

      // For message notifications, check if there's an existing unread notification
      if (type === "message" && conversationId) {
        const existingNotification = await Notification.findOne({
          userId,
          type: "message",
          conversationId,
          status: "unread"
        })

        if (existingNotification) {
          // Update existing notification instead of creating a new one
          existingNotification.message = message
          existingNotification.createdAt = new Date()
          await existingNotification.save()

          // Emit socket event for updated notification
          if (req.app.get("io")) {
            req.app.get("io").emit("sendNotification", {
              ...existingNotification.toObject(),
              userId,
              isUpdate: true
            })
          }

          return res.status(200).json({
            success: true,
            notification: existingNotification
          })
        }
      }

      const notification = await Notification.create({
        title,
        message,
        userId,
        type,
        shopId,
        clickAction,
        senderId,
        conversationId
      })

      // Emit socket event for new notification
      if (req.app.get("io")) {
        req.app.get("io").emit("sendNotification", {
          ...notification.toObject(),
          userId,
          isUpdate: false
        })
      }

      res.status(201).json({
        success: true,
        notification
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  })
)

// Get all notifications for a user with pagination
router.get(
  "/get-all-notifications",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query
      const skip = (page - 1) * limit

      // Clean up expired notifications
      await Notification.updateMany(
        {
          expiresAt: { $lt: new Date() },
          status: { $ne: "archived" }
        },
        { status: "archived" }
      )

      const notifications = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))

      const total = await Notification.countDocuments({ userId: req.user.id })

      res.status(200).json({
        success: true,
        notifications,
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit)
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  })
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

      if (notification.userId.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to update this notification", 403))
      }

      notification.status = "read"
      await notification.save()

      // Emit socket event for notification read
      if (req.app.get("io")) {
        req.app.get("io").emit("markNotificationAsRead", {
          notificationId: notification._id,
          userId: req.user.id
        })
      }

      res.status(200).json({
        success: true,
        notification
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  })
)

// Mark all notifications as read
router.put(
  "/mark-all-as-read",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      await Notification.updateMany(
        { userId: req.user.id, status: "unread" },
        { status: "read" }
      )

      // Emit socket event for all notifications read
      if (req.app.get("io")) {
        req.app.get("io").emit("markAllNotificationsAsRead", {
          userId: req.user.id
        })
      }

      res.status(200).json({
        success: true,
        message: "All notifications marked as read"
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  })
)

// Archive a notification
router.put(
  "/archive/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findById(req.params.id)

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404))
      }

      if (notification.userId.toString() !== req.user.id) {
        return next(new ErrorHandler("You are not authorized to archive this notification", 403))
      }

      notification.status = "archived"
      await notification.save()

      // Emit socket event for notification archived
      if (req.app.get("io")) {
        req.app.get("io").emit("archiveNotification", {
          notificationId: notification._id,
          userId: req.user.id
        })
      }

      res.status(200).json({
        success: true,
        notification
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  })
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
  })
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
  })
)

module.exports = router

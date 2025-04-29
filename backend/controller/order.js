const express = require("express")
const router = express.Router()
const ErrorHandler = require("../utils/ErrorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth")
const Order = require("../model/order")
const Shop = require("../model/shop")
const Product = require("../model/product")
const Notification = require("../model/notification")
const axios = require("axios")

// create new order
router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body

      // Validate required fields
      if (
        !cart || !Array.isArray(cart) || cart.length === 0 ||
        !shippingAddress || !user || !totalPrice === undefined ||
        req.body.subTotalPrice === undefined || req.body.shipping === undefined || !paymentInfo
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields for order creation."
        });
      }

      // Validate product IDs
      for (const item of cart) {
        const productExists = await Product.findById(item.productId);
        if (!productExists) {
          return res.status(400).json({
            success: false,
            message: `Invalid product ID: ${item.productId}`
          });
        }
      }

      // group cart items by shopId
      const shopItemsMap = new Map()

      for (const item of cart) {
        const shopId = item.shopId
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, [])
        }
        shopItemsMap.get(shopId).push(item)
      }

      // create an order for each shop
      const orders = []

      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          subTotalPrice: req.body.subTotalPrice,
          shipping: req.body.shipping,
          paymentInfo,
        })
        orders.push(order)

        // Create notification for seller
        await Notification.create({
          title: "New Order Received",
          message: `You have a new order from ${user.name}`,
          userId: shopId,
          type: "order",
          shopId: shopId,
          clickAction: `/dashboard-orders/${order._id}`,
        })

        // Create notification for buyer
        await Notification.create({
          title: "Order Placed",
          message: "Your order has been placed successfully",
          userId: user._id,
          type: "order",
          shopId: shopId,
          clickAction: `/order/${order._id}`,
        })

        // Emit socket events
        if (req.app.get("io")) {
          // Notify seller
          req.app.get("io").to(shopId).emit("newOrder", {
            userId: user._id,
            orderId: order._id,
            message: `You have a new order from ${user.name}!`,
          })
          
          // Notify buyer
          req.app.get("io").to(user._id).emit("orderPlaced", {
            orderId: order._id,
            message: "Your order has been placed successfully!",
          })
        }
      }

      res.status(201).json({
        success: true,
        orders,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  })
)

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      })

      res.status(200).json({
        success: true,
        orders,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      })

      res.status(200).json({
        success: true,
        orders,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// update order status
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id)
      
      if (!order) {
        return next(new ErrorHandler("Order not found", 404))
      }

      const { status } = req.body
      order.status = status
      await order.save()

      // Create notification for buyer
      const notification = await Notification.create({
        title: "Order Status Updated",
        message: `Your order status has been updated to ${status}`,
        userId: order.user._id,
        type: "order_update",
        shopId: order.cart[0].shopId,
        clickAction: `/order/${order._id}`,
      })

      // Emit socket events
      if (req.app.get("io")) {
        // Notify buyer about status update
        req.app.get("io").to(order.user._id).emit("orderStatusUpdated", {
          orderId: order._id,
          status: status,
          message: `Your order status has been updated to ${status}`,
          notification: notification
        })

        // Notify seller about successful update
        req.app.get("io").to(order.cart[0].shopId).emit("orderStatusUpdateSuccess", {
          orderId: order._id,
          status: status,
          message: `Order status updated to ${status}`
        })
      }

      res.status(200).json({
        success: true,
        order,
        message: "Order status updated successfully"
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  })
)

// update payment status
router.put(
  "/update-payment-status/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id)
      
      if (!order) {
        return next(new ErrorHandler("Order not found", 404))
      }

      const { paymentInfo } = req.body
      order.paymentInfo = paymentInfo
      await order.save()

      // Create notification for seller
      await Notification.create({
        title: "Payment Received",
        message: `Payment received for order #${order._id}`,
        userId: order.cart[0].shopId,
        type: "payment",
        shopId: order.cart[0].shopId,
        clickAction: `/dashboard-orders/${order._id}`,
      })

      // Create notification for buyer
      await Notification.create({
        title: "Payment Successful",
        message: "Your payment has been processed successfully",
        userId: order.user._id,
        type: "payment",
        shopId: order.cart[0].shopId,
        clickAction: `/order/${order._id}`,
      })

      // Emit socket events
      if (req.app.get("io")) {
        // Notify seller
        req.app.get("io").to(order.cart[0].shopId).emit("paymentReceived", {
          orderId: order._id,
          message: `Payment received for order #${order._id}`,
        })
        
        // Notify buyer
        req.app.get("io").to(order.user._id).emit("paymentSuccessful", {
          orderId: order._id,
          message: "Your payment has been processed successfully",
        })
      }

      res.status(200).json({
        success: true,
        order,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  })
)

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id)

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400))
      }

      order.status = req.body.status

      // Emit socket event to notify the shop owner
      if (req.app.get("io")) {
        req.app
          .get("io")
          .to(order.cart[0].shopId)
          .emit("refundRequested", {
            orderId: order._id,
            message: `A refund has been requested for order #${order._id.toString().substring(0, 8)}.`,
          })
      }

      await order.save({ validateBeforeSave: false })

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id)

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400))
      }

      order.status = req.body.status

      await order.save()

      // Emit socket event to notify the user
      if (req.app.get("io")) {
        req.app
          .get("io")
          .to(order.user._id)
          .emit("refundApproved", {
            orderId: order._id,
            message: `Your refund request for order #${order._id.toString().substring(0, 8)} has been approved.`,
          })
      }

      res.status(200).json({
        success: true,
        message: "Order Refund successfull!",
      })

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty)
        })
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id)

        product.stock += qty
        product.sold_out -= qty

        await product.save({ validateBeforeSave: false })
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      })
      res.status(201).json({
        success: true,
        orders,
      })
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
)

module.exports = router

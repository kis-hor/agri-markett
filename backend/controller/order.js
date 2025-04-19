const express = require("express")
const router = express.Router()
const ErrorHandler = require("../utils/ErrorHandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth")
const Order = require("../model/order")
const Shop = require("../model/shop")
const Product = require("../model/product")
// const createNotification = require("../utils/createNotification") // Remove this line
const axios = require("axios")

// create new order
router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body

      //   group cart items by shopId
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
          paymentInfo,
        })
        orders.push(order)

        // Emit socket event to notify the shop owner
        if (req.app.get("io")) {
          req.app
            .get("io")
            .to(shopId)
            .emit("newOrder", {
              userId: user._id,
              orderId: order._id,
              message: `You have a new order from ${user.name}!`,
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
  }),
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

// update order status for seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id)

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400))
      }

      // Update inventory when order is transferred to delivery partner
      if (req.body.status === "Transferred to delivery partner") {
        for (const o of order.cart) {
          await updateOrder(o._id, o.qty)
        }
      }

      order.status = req.body.status

      // Handle delivered orders
      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now()

        // Only update payment status if it's not already succeeded
        if (order.paymentInfo.status !== "Succeeded") {
          order.paymentInfo.status = "Succeeded"
        }

        const serviceCharge = order.totalPrice * 0.1
        await updateSellerInfo(order.totalPrice - serviceCharge)

        // Emit socket event to notify the user
        if (req.app.get("io")) {
          req.app
            .get("io")
            .to(order.user._id)
            .emit("orderDelivered", {
              orderId: order._id,
              message: `Your order #${order._id.toString().substring(0, 8)} has been delivered successfully. You can now leave a review!`,
            })
        }
      }

      await order.save({ validateBeforeSave: false })

      res.status(200).json({
        success: true,
        order,
      })

      async function updateOrder(id, qty) {
        const product = await Product.findById(id)

        if (product) {
          product.stock -= qty
          product.sold_out += qty

          await product.save({ validateBeforeSave: false })
        }
      }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id)

        if (seller) {
          seller.availableBalance = amount

          await seller.save()
        }
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500))
    }
  }),
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

"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useSelector } from "react-redux"
import io from "socket.io-client"
import { server } from "../../server"

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const { seller } = useSelector((state) => state.seller)
  const { user } = useSelector((state) => state.user)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState(null)
  const [userType, setUserType] = useState(null) // 'buyer' or 'seller'

  // Determine if we're in seller or buyer context
  useEffect(() => {
    if (seller?._id) {
      setUserType("seller")
    } else if (user?._id) {
      setUserType("buyer")
    } else {
      setUserType(null)
    }
  }, [seller, user])

  // Connect to socket when component mounts
  useEffect(() => {
    if ((seller?._id || user?._id) && !socket) {
      const newSocket = io(server)
      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [seller?._id, user?._id, socket])

  // Set up socket listeners
  useEffect(() => {
    if (socket) {
      // Add user to socket
      if (seller?._id) {
        socket.emit("addUser", seller._id)
      } else if (user?._id) {
        socket.emit("addUser", user._id)
      }

      // Listen for notifications
      socket.on("getNotification", (data) => {
        // Check if notification is for the current user type
        if (
          (userType === "seller" && data.userType !== "buyer") ||
          (userType === "buyer" && data.userType !== "seller")
        ) {
          const newNotification = {
            id: Date.now(),
            message: data.message || "New notification",
            type: data.type || "info",
            time: new Date(),
            read: false,
            link: data.link || null,
          }

          setNotifications((prev) => [newNotification, ...prev].slice(0, 20)) // Keep only the 20 most recent
          setUnreadCount((prev) => prev + 1)

          // Auto-dismiss after 5 minutes
          setTimeout(
            () => {
              setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id))
            },
            5 * 60 * 1000,
          )
        }
      })

      // Mock notifications for testing (remove in production)
      if (process.env.NODE_ENV === "development") {
        const mockTypes =
          userType === "seller"
            ? ["order", "message", "payment", "review"]
            : ["order_update", "promotion", "wishlist", "restock"]

        const mockMessages =
          userType === "seller"
            ? [
                "New order received",
                "Customer sent you a message",
                "Payment received",
                "New review on your product",
                "Order status updated",
              ]
            : [
                "Your order has been shipped",
                "New promotion available",
                "Item in your wishlist is on sale",
                "Item in your cart is back in stock",
                "Your payment was processed",
              ]

        const mockLinks =
          userType === "seller"
            ? ["/dashboard-orders", "/dashboard-messages", "/dashboard", "/dashboard-products"]
            : ["/profile", "/products", "/best-selling", "/checkout"]

        // Send a mock notification every 30 seconds for testing
        const interval = setInterval(() => {
          const typeIndex = Math.floor(Math.random() * mockTypes.length)
          const type = mockTypes[typeIndex]
          const message = mockMessages[Math.floor(Math.random() * mockMessages.length)]
          const link = mockLinks[typeIndex % mockLinks.length]

          const newNotification = {
            id: Date.now(),
            message,
            type,
            time: new Date(),
            read: false,
            link,
          }

          setNotifications((prev) => [newNotification, ...prev].slice(0, 20))
          setUnreadCount((prev) => prev + 1)
        }, 30000)

        return () => clearInterval(interval)
      }
    }
  }, [socket, seller?._id, user?._id, userType])

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
    setUnreadCount(0)
  }

  // Mark a single notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  // Clear a notification
  const clearNotification = (id) => {
    const notification = notifications.find((n) => n.id === id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        markAsRead,
        clearNotification,
        clearAllNotifications,
        userType,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

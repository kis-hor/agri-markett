"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { io } from "socket.io-client"
import { server, socket_url } from "../../server"

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
    if (user) {
      const newSocket = io(socket_url, {
        withCredentials: true,
        transports: ["websocket"],
      })

      newSocket.on("connect", () => {
        console.log("Socket connected")
        const userType = user.role === "seller" ? "shop" : "user"
        newSocket.emit("addUser", {
          userId: user._id,
          userType,
        })
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })

      // Listen for new order notifications
      newSocket.on("newOrder", (data) => {
        console.log("New order notification received:", data)
        setNotifications((prev) => [{
          id: Date.now(),
          title: "New Order",
          message: data.message,
          type: "order",
          time: new Date(),
          read: false,
          link: `/dashboard-orders/${data.orderId}`
        }, ...prev])
        setUnreadCount((prev) => prev + 1)
      })

      // Listen for order status updates
      newSocket.on("orderStatusUpdated", (data) => {
        console.log("Order status update received:", data)
        setNotifications((prev) => [{
          id: Date.now(),
          title: "Order Status Updated",
          message: data.message,
          type: "order_update",
          time: new Date(),
          read: false,
          link: `/order/${data.orderId}`
        }, ...prev])
        setUnreadCount((prev) => prev + 1)
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
      }
    }
  }, [user])

  // Set up socket listeners
  useEffect(() => {
    if (socket) {
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
    }
  }, [socket, userType])

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

import React, { createContext, useContext, useEffect, useState } from "react"
import io from "socket.io-client"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { useDispatch } from "react-redux"
import { getAllNotifications, getUnreadNotificationCount } from "../redux/actions/notification"

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { isSeller } = useSelector((state) => state.seller)
  const dispatch = useDispatch()

  // Load initial notifications
  useEffect(() => {
    dispatch(getAllNotifications())
    dispatch(getUnreadNotificationCount())
  }, [dispatch])

  useEffect(() => {
    if (user && isAuthenticated) {
      const newSocket = io("http://localhost:4000", {
        withCredentials: true,
        transports: ["websocket"],
      })

      newSocket.on("connect", () => {
        console.log("Connected to socket server")
        newSocket.emit("addUser", {
          userId: user._id,
          userType: isSeller ? "seller" : "buyer"
        })
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })

      newSocket.on("getNotification", (data) => {
        const newNotification = {
          id: Date.now(),
          type: data.type,
          message: data.message,
          time: data.timestamp,
          read: false
        }
        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)
      })

      newSocket.on("newOrder", (data) => {
        const newNotification = {
          id: Date.now(),
          type: "new_order",
          message: "New order received",
          time: new Date(),
          read: false,
          link: `/dashboard/orders/${data._id}`
        }
        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)
      })

      newSocket.on("orderStatusUpdated", (data) => {
        const newNotification = {
          id: Date.now(),
          type: "order_update",
          message: `Order #${data._id} status updated to ${data.status}`,
          time: new Date(),
          read: false,
          link: isSeller ? `/dashboard-order/${data._id}` : `/order/${data._id}`
        }
        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user, isAuthenticated, isSeller])

  const sendNotification = (data) => {
    if (socket) {
      socket.emit("sendNotification", data)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev])
    setUnreadCount((prev) => prev + 1)
  }

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  const handleNotificationClick = (notification) => {
    if (notification.status === "unread") {
      markAsRead(notification._id)
    }

    if (notification.type === "message") {
      window.location.href = `/inbox?conversation=${notification.conversationId}`
    } else if (notification.clickAction) {
      window.location.href = notification.clickAction
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        sendNotification,
        clearNotifications,
        socket,
        addNotification,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
        userType: isSeller ? "seller" : "buyer"
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
} 
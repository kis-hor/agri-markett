"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  getAllNotifications,
  getUnreadNotificationCount,
  markAllAsRead,
  deleteNotification,
} from "../../redux/actions/notification"
import { BsBell, BsBellFill } from "react-icons/bs"
import { RxCross1 } from "react-icons/rx"
import { Link } from "react-router-dom"

// Custom date formatter to replace date-fns
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const formattedHours = hours % 12 || 12

  return `${month} ${day}, ${year} • ${formattedHours}:${minutes} ${ampm}`
}

// Format time ago for notifications
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
}

const NotificationsDropdown = () => {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()

  // Fix: Add a default empty object to handle undefined state
  const notificationState = useSelector((state) => state.notification) || {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
  }

  const { notifications = [], unreadCount = 0, isLoading = false } = notificationState
  const { user } = useSelector((state) => state.user) || { user: null }

  useEffect(() => {
    if (user) {
      dispatch(getAllNotifications())
      dispatch(getUnreadNotificationCount())
    }
  }, [dispatch, user])

  // Fix: Update the function to match the action name
  const handleMarkAsRead = (id) => {
    // Since there's no individual mark as read function, we'll use a workaround
    // You may need to implement this function in your notification actions
    console.log("Mark as read functionality needs to be implemented for ID:", id)
    // For now, refresh notifications after a short delay
    setTimeout(() => {
      dispatch(getAllNotifications())
      dispatch(getUnreadNotificationCount())
    }, 300)
  }

  // Fix: Update the function to match the action name
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleDelete = (id) => {
    dispatch(deleteNotification(id))
  }

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case "order":
        return `/user/order/${notification.clickAction}`
      case "product":
        return `/product/${notification.clickAction}`
      case "payment":
        return `/user/order/${notification.clickAction}`
      default:
        return "#"
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-center cursor-pointer" onClick={() => setOpen(!open)}>
        {unreadCount > 0 ? (
          <div className="relative">
            <BsBellFill size={25} color="rgb(255 255 255 / 83%)" />
            <span className="absolute -right-1 -top-1 rounded-full bg-[#3bc177] w-5 h-5 top right p-0 m-0 text-white font-mono text-[12px] leading-tight text-center">
              {unreadCount}
            </span>
          </div>
        ) : (
          <BsBell size={25} color="rgb(255 255 255 / 83%)" />
        )}
      </div>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <button className="text-sm text-green-600 hover:text-green-800" onClick={handleMarkAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : notifications && notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b hover:bg-gray-50 ${notification.status === "unread" ? "bg-green-50" : ""}`}
                >
                  <div className="flex justify-between">
                    <Link
                      to={getNotificationLink(notification)}
                      className="flex-1"
                      onClick={() => {
                        if (notification.status === "unread") {
                          handleMarkAsRead(notification._id)
                        }
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-start">
                        {notification.image ? (
                          <img
                            src={notification.image || "/placeholder.svg"}
                            alt=""
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full mr-3 bg-green-100 flex items-center justify-center">
                            <BsBell size={20} className="text-green-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <RxCross1 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No notifications</div>
          )}

          {notifications && notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <Link
                to="/notifications"
                className="text-green-600 hover:text-green-800 font-medium"
                onClick={() => setOpen(false)}
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsDropdown

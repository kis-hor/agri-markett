"use client"

import { useState, useRef, useEffect } from "react"
import { IoMdNotificationsOutline } from "react-icons/io"
import { useNotification } from "../Context/NotificationContext"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { MdOutlineShoppingBag, MdOutlineMessage, MdOutlinePayment, MdOutlineRateReview } from "react-icons/md"
import { IoCloseOutline } from "react-icons/io5"

const NotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const notificationRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <MdOutlineShoppingBag className="text-green-500" size={20} />
      case "message":
        return <MdOutlineMessage className="text-blue-500" size={20} />
      case "payment":
        return <MdOutlinePayment className="text-purple-500" size={20} />
      case "review":
        return <MdOutlineRateReview className="text-yellow-500" size={20} />
      default:
        return <MdOutlineShoppingBag className="text-gray-500" size={20} />
    }
  }

  // Format time to relative format (e.g., "2 minutes ago")
  const formatTime = (time) => {
    const now = new Date()
    const notificationTime = new Date(time)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return format(notificationTime, "MMM d, yyyy")
  }

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
  }

  return (
    <div className="relative" ref={notificationRef}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && unreadCount > 0) {
            markAllAsRead()
          }
        }}
      >
        <IoMdNotificationsOutline size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <button className="text-xs text-blue-600 hover:text-blue-800" onClick={() => markAllAsRead()}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-start ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="mr-3 mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1">
                    {notification.link ? (
                      <Link
                        to={notification.link}
                        className="block"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(notification.time)}</p>
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(notification.time)}</p>
                      </>
                    )}
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 p-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearNotification(notification.id)
                    }}
                  >
                    <IoCloseOutline size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell

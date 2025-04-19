"use client"

import { useEffect, useState } from "react"
import { useNotification } from "../components/Context/NotificationContext"
import {
  MdOutlineLocalShipping,
  MdOutlineLocalOffer,
  MdOutlineFavoriteBorder,
  MdOutlineInventory,
  MdOutlinePayment,
} from "react-icons/md"
import { IoCloseOutline } from "react-icons/io5"
import { Link } from "react-router-dom"

const UserNotificationToast = () => {
  const { notifications, markAsRead, clearNotification, userType } = useNotification()
  const [visibleNotification, setVisibleNotification] = useState(null)
  const [isExiting, setIsExiting] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  // Don't render if not a buyer
  useEffect(() => {
    setShouldRender(userType === "buyer")
  }, [userType])

  // Show the most recent unread notification
  useEffect(() => {
    if (shouldRender) {
      if (notifications.length > 0) {
        const unreadNotifications = notifications.filter((n) => !n.read)
        if (unreadNotifications.length > 0 && !visibleNotification) {
          setVisibleNotification(unreadNotifications[0])

          // Auto-dismiss after 5 seconds
          const timer = setTimeout(() => {
            dismissNotification()
          }, 5000)

          return () => clearTimeout(timer)
        }
      }
    }
  }, [notifications, visibleNotification, shouldRender])

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "order_update":
        return <MdOutlineLocalShipping className="text-white" size={24} />
      case "promotion":
        return <MdOutlineLocalOffer className="text-white" size={24} />
      case "wishlist":
        return <MdOutlineFavoriteBorder className="text-white" size={24} />
      case "restock":
        return <MdOutlineInventory className="text-white" size={24} />
      case "payment":
        return <MdOutlinePayment className="text-white" size={24} />
      default:
        return <MdOutlineLocalShipping className="text-white" size={24} />
    }
  }

  // Get background color based on notification type
  const getBackgroundColor = (type) => {
    switch (type) {
      case "order_update":
        return "bg-green-500"
      case "promotion":
        return "bg-blue-500"
      case "wishlist":
        return "bg-red-500"
      case "restock":
        return "bg-purple-500"
      case "payment":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  // Dismiss notification with animation
  const dismissNotification = () => {
    setIsExiting(true)
    setTimeout(() => {
      if (visibleNotification) {
        markAsRead(visibleNotification.id)
      }
      setVisibleNotification(null)
      setIsExiting(false)
    }, 300)
  }

  // Handle notification click
  const handleNotificationClick = () => {
    if (visibleNotification) {
      markAsRead(visibleNotification.id)
      setVisibleNotification(null)
    }
  }

  if (!shouldRender) return null

  if (!visibleNotification) return null

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-50 ${
        isExiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="flex">
        <div className={`${getBackgroundColor(visibleNotification.type)} p-4 flex items-center justify-center`}>
          {getIcon(visibleNotification.type)}
        </div>
        <div className="p-4 flex-1">
          {visibleNotification.link ? (
            <Link to={visibleNotification.link} onClick={handleNotificationClick}>
              <h4 className="font-semibold text-gray-800">{visibleNotification.message}</h4>
            </Link>
          ) : (
            <h4 className="font-semibold text-gray-800">{visibleNotification.message}</h4>
          )}
          <p className="text-sm text-gray-600 mt-1">Click to view details</p>
        </div>
        <button
          className="p-2 text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation()
            dismissNotification()
          }}
        >
          <IoCloseOutline size={20} />
        </button>
      </div>
    </div>
  )
}

export default UserNotificationToast

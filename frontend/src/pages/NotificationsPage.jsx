"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAllNotifications, markAllAsRead, deleteNotification } from "../redux/actions/notification"
import Header from "../components/Layout/Header"
import Footer from "../components/Layout/Footer"
import { BsBell } from "react-icons/bs"
import { RxCross1 } from "react-icons/rx"
import styles from "../styles/styles"
import Loader from "../components/Layout/Loader"

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

const NotificationsPage = () => {
  const dispatch = useDispatch()
  const { notifications = [], unreadCount = 0, loading = false } = useSelector((state) => state.notification) || {}
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    dispatch(getAllNotifications())
  }, [dispatch])

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleDeleteNotification = (id) => {
    dispatch(deleteNotification(id))
  }

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case "order":
        return `/user/order/${notification.orderId}`
      case "product":
        return `/product/${notification.productId}`
      default:
        return "#"
    }
  }

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
        ? notifications.filter((n) => n.status === "unread")
        : notifications.filter((n) => n.status === "read")

  return (
    <div>
      <Header activeHeading={5} />
      <div className="w-full min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <button
                className={`${styles.button} !bg-green-600 !rounded-md !h-[35px] text-white px-4`}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="flex border-b mb-4">
            <button
              className={`py-2 px-4 ${activeTab === "all" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={`py-2 px-4 ${activeTab === "unread" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("unread")}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              className={`py-2 px-4 ${activeTab === "read" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500"}`}
              onClick={() => setActiveTab("read")}
            >
              Read
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border rounded-lg ${notification.status === "unread" ? "bg-green-50 border-green-100" : "bg-white"}`}
                >
                  <div className="flex justify-between">
                    <a href={getNotificationLink(notification)} className="flex-1">
                      <div className="flex items-start">
                        {notification.image ? (
                          <img
                            src={notification.image || "/placeholder.svg"}
                            alt=""
                            className="w-12 h-12 rounded-full mr-4 object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full mr-4 bg-green-100 flex items-center justify-center">
                            <BsBell size={24} className="text-green-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3
                            className={`font-medium ${notification.status === "unread" ? "text-black" : "text-gray-700"}`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-gray-500 text-sm mt-2">{formatDate(notification.createdAt)}</p>
                        </div>
                      </div>
                    </a>
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <RxCross1 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BsBell size={30} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">No notifications</h3>
              <p className="text-gray-500 mt-2">
                {activeTab === "all"
                  ? "You don't have any notifications yet."
                  : activeTab === "unread"
                    ? "You don't have any unread notifications."
                    : "You don't have any read notifications."}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default NotificationsPage

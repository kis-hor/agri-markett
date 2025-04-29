import axios from "axios"
import { server } from "../../server"

// Get all notifications
export const getAllNotifications = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllNotificationsRequest",
    })

    const { data } = await axios.get(`${server}/notification/get-all-notifications`, {
      withCredentials: true,
    })

    dispatch({
      type: "getAllNotificationsSuccess",
      payload: data.notifications,
    })
  } catch (error) {
    dispatch({
      type: "getAllNotificationsFailed",
      payload: error.response?.data?.message || "Failed to fetch notifications",
    })
  }
}

// Get unread notification count
export const getUnreadNotificationCount = () => async (dispatch) => {
  try {
    dispatch({
      type: "getUnreadCountRequest",
    })

    const { data } = await axios.get(`${server}/notification/get-unread-count`, {
      withCredentials: true,
    })

    dispatch({
      type: "getUnreadCountSuccess",
      payload: data.unreadCount,
    })
  } catch (error) {
    dispatch({
      type: "getUnreadCountFailed",
      payload: error.response?.data?.message || "Failed to fetch unread count",
    })
  }
}

// Mark all notifications as read
export const markAllAsRead = () => async (dispatch) => {
  try {
    dispatch({
      type: "markAllNotificationsRequest",
    })

    const { data } = await axios.put(
      `${server}/notification/mark-all-as-read`,
      {},
      {
        withCredentials: true,
      },
    )

    dispatch({
      type: "markAllNotificationsSuccess",
    })

    // Refresh the notifications list
    dispatch(getAllNotifications())
    dispatch(getUnreadNotificationCount())
  } catch (error) {
    dispatch({
      type: "markAllNotificationsFailed",
      payload: error.response?.data?.message || "Failed to mark all as read",
    })
  }
}

// Delete a notification
export const deleteNotification = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteNotificationRequest",
    })

    const { data } = await axios.delete(`${server}/notification/delete-notification/${id}`, {
      withCredentials: true,
    })

    dispatch({
      type: "deleteNotificationSuccess",
      payload: { id, message: data.message },
    })

    // Refresh the unread count
    dispatch(getUnreadNotificationCount())
  } catch (error) {
    dispatch({
      type: "deleteNotificationFailed",
      payload: error.response?.data?.message || "Failed to delete notification",
    })
  }
}

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

// Mark notification as read
export const markNotificationAsRead = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "markNotificationRequest",
    })

    const { data } = await axios.put(
      `${server}/notification/mark-as-read/${id}`,
      {},
      {
        withCredentials: true,
      },
    )

    dispatch({
      type: "markNotificationSuccess",
      payload: data.notification,
    })
  } catch (error) {
    dispatch({
      type: "markNotificationFailed",
      payload: error.response?.data?.message || "Failed to mark notification as read",
    })
  }
}

// Mark all notifications as read
export const markAllNotificationsAsRead = () => async (dispatch) => {
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
      payload: data.message,
    })
  } catch (error) {
    dispatch({
      type: "markAllNotificationsFailed",
      payload: error.response?.data?.message || "Failed to mark all notifications as read",
    })
  }
}

// Delete notification
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
      payload: {
        message: data.message,
        id,
      },
    })
  } catch (error) {
    dispatch({
      type: "deleteNotificationFailed",
      payload: error.response?.data?.message || "Failed to delete notification",
    })
  }
}

// Get unread notification count
export const getUnreadNotificationCount = () => async (dispatch) => {
  try {
    dispatch({
      type: "getUnreadCountRequest",
    })

    const { data } = await axios.get(`${server}/notification/unread-count`, {
      withCredentials: true,
    })

    dispatch({
      type: "getUnreadCountSuccess",
      payload: data.count,
    })
  } catch (error) {
    dispatch({
      type: "getUnreadCountFailed",
      payload: error.response?.data?.message || "Failed to get unread count",
    })
  }
}

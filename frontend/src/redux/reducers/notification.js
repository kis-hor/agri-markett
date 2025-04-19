import { createReducer } from "@reduxjs/toolkit"

const initialState = {
  isLoading: false,
  notifications: [],
  unreadCount: 0,
  error: null,
  success: false,
  message: null,
}

export const notificationReducer = createReducer(initialState, {
  // Get all notifications
  getAllNotificationsRequest: (state) => {
    state.isLoading = true
  },
  getAllNotificationsSuccess: (state, action) => {
    state.isLoading = false
    state.notifications = action.payload
  },
  getAllNotificationsFailed: (state, action) => {
    state.isLoading = false
    state.error = action.payload
  },

  // Mark notification as read
  markNotificationRequest: (state) => {
    state.isLoading = true
  },
  markNotificationSuccess: (state, action) => {
    state.isLoading = false
    state.notifications = state.notifications.map((notification) =>
      notification._id === action.payload._id ? action.payload : notification,
    )
    state.success = true
  },
  markNotificationFailed: (state, action) => {
    state.isLoading = false
    state.error = action.payload
    state.success = false
  },

  // Mark all notifications as read
  markAllNotificationsRequest: (state) => {
    state.isLoading = true
  },
  markAllNotificationsSuccess: (state) => {
    state.isLoading = false
    state.notifications = state.notifications.map((notification) => ({
      ...notification,
      status: "read",
    }))
    state.unreadCount = 0
    state.success = true
  },
  markAllNotificationsFailed: (state, action) => {
    state.isLoading = false
    state.error = action.payload
    state.success = false
  },

  // Delete notification
  deleteNotificationRequest: (state) => {
    state.isLoading = true
  },
  deleteNotificationSuccess: (state, action) => {
    state.isLoading = false
    state.notifications = state.notifications.filter((notification) => notification._id !== action.payload.id)
    state.message = action.payload.message
    state.success = true
  },
  deleteNotificationFailed: (state, action) => {
    state.isLoading = false
    state.error = action.payload
    state.success = false
  },

  // Get unread notification count
  getUnreadCountRequest: (state) => {
    state.isLoading = true
  },
  getUnreadCountSuccess: (state, action) => {
    state.isLoading = false
    state.unreadCount = action.payload
  },
  getUnreadCountFailed: (state, action) => {
    state.isLoading = false
    state.error = action.payload
  },

  // Clear errors and messages
  clearErrors: (state) => {
    state.error = null
  },
  clearMessages: (state) => {
    state.message = null
    state.success = false
  },
})

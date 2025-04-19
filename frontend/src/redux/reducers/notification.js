const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  isLoading: false,
  error: null,
  success: false,
}

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    // Get all notifications
    case "getAllNotificationsRequest":
      return {
        ...state,
        loading: true,
      }
    case "getAllNotificationsSuccess":
      return {
        ...state,
        loading: false,
        notifications: action.payload,
      }
    case "getAllNotificationsFailed":
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    // Get unread count
    case "getUnreadCountRequest":
      return {
        ...state,
        isLoading: true,
      }
    case "getUnreadCountSuccess":
      return {
        ...state,
        isLoading: false,
        unreadCount: action.payload,
      }
    case "getUnreadCountFailed":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    // Mark notification as read
    case "markNotificationRequest":
      return {
        ...state,
        isLoading: true,
      }
    case "markNotificationSuccess":
      return {
        ...state,
        isLoading: false,
        notifications: state.notifications.map((notification) =>
          notification._id === action.payload._id ? { ...notification, status: "read" } : notification,
        ),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
      }
    case "markNotificationFailed":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    // Mark all as read
    case "markAllNotificationsRequest":
      return {
        ...state,
        isLoading: true,
      }
    case "markAllNotificationsSuccess":
      return {
        ...state,
        isLoading: false,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          status: "read",
        })),
        unreadCount: 0,
      }
    case "markAllNotificationsFailed":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    // Delete notification
    case "deleteNotificationRequest":
      return {
        ...state,
        isLoading: true,
      }
    case "deleteNotificationSuccess":
      return {
        ...state,
        isLoading: false,
        notifications: state.notifications.filter((notification) => notification._id !== action.payload.id),
        unreadCount: state.notifications.find(
          (notification) => notification._id === action.payload.id && notification.status === "unread",
        )
          ? state.unreadCount > 0
            ? state.unreadCount - 1
            : 0
          : state.unreadCount,
      }
    case "deleteNotificationFailed":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      }

    default:
      return state
  }
}

import { server } from "../../server"
import axios from "axios"

// Create Message
export const createMessageRequest = () => ({
  type: "createMessageRequest",
})

export const createMessageSuccess = (message) => ({
  type: "createMessageSuccess",
  payload: message,
})

export const createMessageFail = (error) => ({
  type: "createMessageFail",
  payload: error,
})

// Get All Messages
export const getAllMessagesRequest = () => ({
  type: "getAllMessagesRequest",
})

export const getAllMessagesSuccess = (messages) => ({
  type: "getAllMessagesSuccess",
  payload: messages,
})

export const getAllMessagesFail = (error) => ({
  type: "getAllMessagesFail",
  payload: error,
})

// Async Actions
export const createNewMessage = (messageData) => async (dispatch) => {
  try {
    dispatch(createMessageRequest())
    const { data } = await axios.post(`${server}/message/create-new-message`, messageData)
    dispatch(createMessageSuccess(data.message))
  } catch (error) {
    dispatch(createMessageFail(error.response?.data?.message || "Failed to send message"))
  }
}

export const getAllMessages = (conversationId) => async (dispatch) => {
  try {
    dispatch(getAllMessagesRequest())
    const { data } = await axios.get(`${server}/message/get-all-messages/${conversationId}`)
    dispatch(getAllMessagesSuccess(data.messages))
  } catch (error) {
    dispatch(getAllMessagesFail(error.response?.data?.message || "Failed to fetch messages"))
  }
} 
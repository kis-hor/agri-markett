import { createReducer } from "@reduxjs/toolkit"

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
}

export const messageReducer = createReducer(initialState, (builder) => {
  builder
    // Create Message
    .addCase("createMessageRequest", (state) => {
      state.isLoading = true
      state.error = null
    })
    .addCase("createMessageSuccess", (state, action) => {
      state.isLoading = false
      state.messages.push(action.payload)
    })
    .addCase("createMessageFail", (state, action) => {
      state.isLoading = false
      state.error = action.payload
    })
    // Get All Messages
    .addCase("getAllMessagesRequest", (state) => {
      state.isLoading = true
      state.error = null
    })
    .addCase("getAllMessagesSuccess", (state, action) => {
      state.isLoading = false
      state.messages = action.payload
    })
    .addCase("getAllMessagesFail", (state, action) => {
      state.isLoading = false
      state.error = action.payload
    })
}) 
import axios from "axios"
import { server } from "../../server"

// load user
export const loadUser = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadUserRequest",
    })
    const response = await axios.get(`${server}/user/getuser`, {
      withCredentials: true,
    })

    // Fix: Add proper error handling
    if (!response || !response.data) {
      throw new Error("Invalid response from server")
    }

    dispatch({
      type: "LoadUserSuccess",
      payload: response.data.user,
    })
  } catch (error) {
    dispatch({
      type: "LoadUserFail",
      payload: error.response?.data?.message || "Failed to load user",
    })
  }
}

// load seller
export const loadSeller = () => async (dispatch) => {
  try {
    dispatch({
      type: "LoadSellerRequest",
    })
    const response = await axios.get(`${server}/shop/getSeller`, {
      withCredentials: true,
    })

    // Fix: Add proper error handling
    if (!response || !response.data) {
      throw new Error("Invalid response from server")
    }

    dispatch({
      type: "LoadSellerSuccess",
      payload: response.data.seller,
    })
  } catch (error) {
    dispatch({
      type: "LoadSellerFail",
      payload: error.response?.data?.message || "Failed to load seller",
    })
  }
}

// user update information
export const updateUserInformation = (name, email, phoneNumber, password) => async (dispatch) => {
  try {
    dispatch({
      type: "updateUserInfoRequest",
    })

    const response = await axios.put(
      `${server}/user/update-user-info`,
      {
        email,
        password,
        phoneNumber,
        name,
      },
      {
        withCredentials: true,
        headers: {
          "Access-Control-Allow-Credentials": true,
        },
      },
    )

    // Fix: Add proper error handling
    if (!response || !response.data) {
      throw new Error("Invalid response from server")
    }

    dispatch({
      type: "updateUserInfoSuccess",
      payload: response.data.user,
    })
  } catch (error) {
    dispatch({
      type: "updateUserInfoFailed",
      payload: error.response?.data?.message || "Failed to update user information",
    })
  }
}

// update user address
export const updatUserAddress = (country, city, address1, address2, zipCode, addressType) => async (dispatch) => {
  try {
    dispatch({
      type: "updateUserAddressRequest",
    })

    const response = await axios.put(
      `${server}/user/update-user-addresses`,
      {
        country,
        city,
        address1,
        address2,
        zipCode,
        addressType,
      },
      { withCredentials: true },
    )

    // Fix: Add proper error handling
    if (!response || !response.data) {
      throw new Error("Invalid response from server")
    }

    dispatch({
      type: "updateUserAddressSuccess",
      payload: {
        successMessage: "User address updated succesfully!",
        user: response.data.user,
      },
    })
  } catch (error) {
    dispatch({
      type: "updateUserAddressFailed",
      payload: error.response?.data?.message || "Failed to update user address",
    })
  }
}

// delete user address
export const deleteUserAddress = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteUserAddressRequest",
    })

    const response = await axios.delete(`${server}/user/delete-user-address/${id}`, { withCredentials: true })

    // Fix: Add proper error handling
    if (!response || !response.data) {
      throw new Error("Invalid response from server")
    }

    dispatch({
      type: "deleteUserAddressSuccess",
      payload: {
        successMessage: "User deleted successfully!",
        user: response.data.user,
      },
    })
  } catch (error) {
    dispatch({
      type: "deleteUserAddressFailed",
      payload: error.response?.data?.message || "Failed to delete user address",
    })
  }
}

// get all users --- admin
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllUsersRequest",
    })

    const response = await axios.get(`${server}/user/admin-all-users`, {
      withCredentials: true,
    })

    // Fix: Add proper error handling
    if (!response || !response.data) {
      throw new Error("Invalid response from server")
    }

    dispatch({
      type: "getAllUsersSuccess",
      payload: response.data.users,
    })
  } catch (error) {
    dispatch({
      type: "getAllUsersFailed",
      payload: error.response?.data?.message || "Failed to get all users",
    })
  }
}

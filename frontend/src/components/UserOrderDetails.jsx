"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import styles from "../styles/styles"
import { getAllOrdersOfUser } from "../redux/actions/order"
import { server } from "../server"
import { RxCross1 } from "react-icons/rx"
import axios from "axios"
import { toast } from "react-toastify"
import { socket } from "../socket"
import Loader from "./Layout/Loader"

const UserOrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order)
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [rating, setRating] = useState(1)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { id } = useParams()

  useEffect(() => {
    if (user && user._id) {
      dispatch(getAllOrdersOfUser(user._id))
    }
  }, [dispatch, user])

  useEffect(() => {
    if (socket) {
      socket.on("orderStatusUpdated", (data) => {
        if (data.orderId === id) {
          toast.success(data.message)
          if (user && user._id) {
            dispatch(getAllOrdersOfUser(user._id))
          }
        }
      })
    }

    return () => {
      if (socket) {
        socket.off("orderStatusUpdated")
      }
    }
  }, [id, dispatch, user])

  const data = orders && orders.find((item) => item._id === id)

  const getProgressWidth = () => {
    switch (data?.status) {
      case "Processing":
        return "5%"
      case "Transferred to delivery partner":
        return "20%"
      case "Shipping":
        return "50%"
      case "Received":
        return "70%"
      case "On the way":
        return "90%"
      case "Delivered":
        return "100%"
      default:
        return "0%"
    }
  }

  const getBarColor = () => {
    switch (data?.status) {
      case "Processing":
        return "#f3a847"
      case "Transferred to delivery partner":
        return "#f3a847"
      case "Shipping":
        return "#f3a847"
      case "Received":
        return "#f3a847"
      case "On the way":
        return "#f3a847"
      case "Delivered":
        return "#00a854"
      default:
        return "#f3a847"
    }
  }

  const reviewHandler = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await axios.post(
        `${server}/product/create-new-review`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id
        },
        { withCredentials: true }
      )

      toast.success("Review added successfully!")
      setOpen(false)
      setSelectedItem(null)
      setRating(1)
      setComment("")
      if (user && user._id) {
        dispatch(getAllOrdersOfUser(user._id))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const refundHandler = async () => {
    try {
      await axios.put(
        `${server}/order/order-refund/${id}`,
        {},
        { withCredentials: true }
      )

      toast.success("Refund request successful!")
      if (user && user._id) {
        dispatch(getAllOrdersOfUser(user._id))
      }
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  if (isLoading) {
    return <Loader />
  }

  if (!data) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Order not found</p>
      </div>
    )
  }

  return (
    <div className="w-full p-8">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-[25px] font-[600] text-[#000000ba] pb-2">
          Order Details
        </h1>
        <Link to="/profile">
          <div className={`${styles.button} !bg-[#fce1e6] !rounded-[4px] text-[#e94560] font-[500] !h-[45px] px-[20px]`}>
            Back to Profile
          </div>
        </Link>
      </div>

      <div className="w-full flex flex-col md:flex-row items-start gap-8 pt-8">
        {/* Order Info */}
        <div className="w-full md:w-2/3 bg-white rounded-[4px] shadow p-4 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="w-full flex justify-between">
              <span className="font-[600]">Order ID: #{data._id?.slice(0, 8)}</span>
              <span className="font-[600]">Placed on: {data.createdAt?.slice(0, 10)}</span>
            </div>
            <div className="w-full flex justify-between">
              <span className="font-[600]">Total Amount: ₹{data.totalPrice}</span>
              <span className={`font-[600] ${
                data.paymentInfo?.status === "Completed" || data.paymentStatus === "Paid"
                  ? "text-green-500"
                  : data.paymentInfo?.type === "COD"
                  ? "text-blue-500"
                  : "text-red-500"
              }`}>
                Payment: {
                  data.paymentInfo?.status === "Completed" || data.paymentStatus === "Paid"
                    ? "Paid"
                    : data.paymentInfo?.type === "COD"
                    ? "Cash On Delivery"
                    : "Pending"
                }
              </span>
            </div>
            <div className="w-full flex justify-between">
              <span className={`font-[600] ${data.status === "Delivered" ? "text-green-500" : "text-[#00000085]"}`}>
                Status: {data.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full mt-8">
            <h4 className="font-[600] mb-4">Order Progress</h4>
            <div className="w-full h-[20px] bg-[#f5f5f5] rounded-full">
              <div
                className="h-full rounded-full"
                style={{ width: getProgressWidth(), backgroundColor: getBarColor() }}
              ></div>
            </div>
          </div>

          {/* Order Items */}
          <div className="w-full mt-8">
            <h4 className="font-[600] mb-4">Order Items</h4>
            <div className="flex flex-col gap-4">
              {data.cart.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b pb-4">
                  {item.images && item.images[0] && (
                    <img
                      src={item.images[0].url || item.images[0]}
                      alt={item.name}
                      className="w-[80px] h-[80px] object-cover rounded-[4px]"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-[600]">{item.name}</h5>
                    <p className="text-[#00000085]">Quantity: {item.qty}</p>
                    <p className="text-[#00000085]">Price: ₹{item.discountPrice}</p>
                    {data.status === "Delivered" && !item.isReviewed && (
                      <button
                        className="mt-2 bg-black text-white px-4 py-2 rounded-[4px] text-sm"
                        onClick={() => {
                          setSelectedItem(item)
                          setOpen(true)
                        }}
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                  <div className="font-[600]">
                    Total: ₹{item.discountPrice * item.qty}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shop Info & Actions */}
        <div className="w-full md:w-1/3 bg-white rounded-[4px] shadow p-4 md:p-8">
          <div className="flex flex-col gap-4">
            <h4 className="font-[600]">Shop Information</h4>
            {data.cart[0]?.shop && (
              <div>
                <p className="font-[600]">Name: {data.cart[0].shop.name}</p>
                <p className="text-[#00000085]">Email: {data.cart[0].shop.email}</p>
                <p className="text-[#00000085]">Phone: {data.cart[0].shop.phoneNumber}</p>
                <p className="text-[#00000085]">Address: {data.cart[0].shop.address}</p>
              </div>
            )}

            <h4 className="font-[600] mt-4">Shipping Address</h4>
            <div>
              <p className="text-[#00000085]">{data.shippingAddress?.address1}</p>
              <p className="text-[#00000085]">{data.shippingAddress?.city}, {data.shippingAddress?.country}</p>
              <p className="text-[#00000085]">ZIP: {data.shippingAddress?.zipCode}</p>
            </div>

            {data.status !== "Delivered" && (
              <button
                className={`${styles.button} !bg-[#fce1e6] !rounded-[4px] text-[#e94560] font-[600] !h-[45px] !w-full mt-4`}
                onClick={refundHandler}
              >
                Request Refund
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {open && (
        <div className="fixed top-0 left-0 w-full h-screen bg-[#00000039] z-50 flex items-center justify-center">
          <div className="w-[90%] 800px:w-[50%] h-[90vh] 800px:h-[85vh] bg-white rounded-[4px] shadow p-8 overflow-y-scroll">
            <div className="w-full flex justify-end">
              <RxCross1
                size={30}
                className="cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>
            <h1 className="text-[25px] font-[600] text-center pb-4">
              Write a Review
            </h1>
            <div className="w-full flex items-center justify-center mb-4">
              {selectedItem?.images && selectedItem.images[0] && (
                <img
                  src={selectedItem.images[0].url || selectedItem.images[0]}
                  alt={selectedItem?.name}
                  className="w-[80px] h-[80px] object-cover rounded-[4px]"
                />
              )}
            </div>
            <h3 className="text-[20px] font-[500] text-center mb-4">
              {selectedItem?.name}
            </h3>
            <div className="flex w-full justify-center mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[50px] h-[50px] flex items-center justify-center">
                  <div
                    className="cursor-pointer"
                    onClick={() => setRating(i)}
                  >
                    {i <= rating ? (
                      <svg
                        className="w-6 h-6 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <textarea
              name="comment"
              placeholder="Write your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-[150px] border border-[#00000028] rounded-[4px] p-4 outline-none resize-none mb-4"
            />
            <button
              className={`${styles.button} !bg-[#17dd1f] !rounded-[4px] text-white font-[600] !h-[45px] !w-full`}
              onClick={reviewHandler}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserOrderDetails

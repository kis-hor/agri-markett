"use client"

import { useEffect, useState } from "react"
import { BsFillBagFill } from "react-icons/bs"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import styles from "../styles/styles"
import { getAllOrdersOfUser } from "../redux/actions/order"
import { server } from "../server"
import { RxCross1 } from "react-icons/rx"
import { AiFillStar, AiOutlineStar } from "react-icons/ai"
import axios from "axios"
import { toast } from "react-toastify"
import Loader from "./Layout/Loader"

const UserOrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order)
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [rating, setRating] = useState(1)
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)

  const { id } = useParams()

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id))
  }, [dispatch, user._id])

  const data = orders && orders.find((item) => item._id === id)

  const reviewHandler = async (e) => {
    e.preventDefault()
    setIsReviewSubmitting(true)

    try {
      const { data } = await axios.put(
        `${server}/product/create-new-review`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id,
        },
        { withCredentials: true },
      )

      toast.success(data.message)
      dispatch(getAllOrdersOfUser(user._id))
      setComment("")
      setRating(1)
      setOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Error submitting review")
    } finally {
      setIsReviewSubmitting(false)
    }
  }

  const refundHandler = async () => {
    try {
      const { data } = await axios.put(
        `${server}/order/order-refund/${id}`,
        {
          status: "Processing refund",
        },
        { withCredentials: true },
      )

      toast.success(data.message)
      dispatch(getAllOrdersOfUser(user._id))
    } catch (error) {
      toast.error(error.response?.data?.message || "Error requesting refund")
    }
  }

  return (
    <div className={`py-4 min-h-screen ${styles.section}`}>
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center">
          <BsFillBagFill size={30} color="crimson" />
          <h1 className="pl-2 text-[25px]">Order Details</h1>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full flex items-center justify-between pt-6">
            <h5 className="text-[#00000084]">
              Order ID: <span>#{data?._id?.slice(0, 8)}</span>
            </h5>
            <h5 className="text-[#00000084]">
              Placed on: <span>{data?.createdAt?.slice(0, 10)}</span>
            </h5>
          </div>

          {/* order status */}
          <div className="mt-8">
            <h4 className="text-[20px] font-[600] mb-4">Order Status</h4>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  data?.status === "Processing"
                    ? "w-1/4 bg-blue-500"
                    : data?.status === "Transferred to delivery partner"
                      ? "w-2/4 bg-yellow-500"
                      : data?.status === "Shipping"
                        ? "w-3/4 bg-yellow-500"
                        : data?.status === "Delivered"
                          ? "w-full bg-green-500"
                          : data?.status === "Processing refund" || data?.status === "Refund Success"
                            ? "w-full bg-red-500"
                            : "w-0"
                }`}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={data?.status === "Processing" ? "text-blue-500 font-medium" : ""}>Processing</span>
              <span className={data?.status === "Transferred to delivery partner" ? "text-yellow-500 font-medium" : ""}>
                Shipped
              </span>
              <span className={data?.status === "Delivered" ? "text-green-500 font-medium" : ""}>Delivered</span>
            </div>
            <p className="text-center mt-2 text-[18px] font-medium">
              Current Status: <span className="font-bold">{data?.status}</span>
            </p>
          </div>

          {/* order items */}
          <div className="mt-8">
            <h4 className="text-[20px] font-[600] mb-4">Order Items</h4>
            {data &&
              data?.cart.map((item, index) => (
                <div key={index} className="w-full flex items-start mb-5 border-b pb-5">
                  <img src={`${item.images[0]?.url}`} alt="" className="w-[80px] h-[80px] object-cover rounded-md" />
                  <div className="w-full pl-5">
                    <h5 className="text-[20px]">{item.name}</h5>
                    <h5 className="text-[20px] text-[#00000091]">
                      Rs.{item.discountPrice} x {item.qty}
                    </h5>
                    {item.isReviewed ? (
                      <div className="flex mt-2">
                        <span className="text-green-500 mr-2">✓ Reviewed</span>
                        <button
                          className="text-blue-500 underline"
                          onClick={() => {
                            setSelectedItem(item)
                            setOpen(true)
                            // Find the existing review to pre-fill
                            const existingReview = item.reviews?.find((rev) => rev.user._id === user._id)
                            if (existingReview) {
                              setRating(existingReview.rating)
                              setComment(existingReview.comment)
                            }
                          }}
                        >
                          Edit Review
                        </button>
                      </div>
                    ) : data?.status === "Delivered" ? (
                      <div
                        className={`${styles.button} text-white mt-3 !w-[170px] !h-[45px]`}
                        onClick={() => setOpen(true) || setSelectedItem(item)}
                      >
                        Write a review
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">You can write a review once the order is delivered</p>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* review popup */}
          {open && (
            <div className="w-full fixed top-0 left-0 h-screen bg-[#0005] z-50 flex items-center justify-center">
              <div className="w-[90%] 800px:w-[60%] h-min bg-white shadow rounded-md p-3">
                <div className="w-full flex justify-end p-3">
                  <RxCross1 size={30} onClick={() => setOpen(false)} className="cursor-pointer" />
                </div>
                <h2 className="text-[30px] font-[500] font-Poppins text-center">
                  {selectedItem?.isReviewed ? "Edit Your Review" : "Write a Review"}
                </h2>
                <br />
                <div className="w-full flex">
                  <img
                    src={`${selectedItem?.images[0]?.url}`}
                    alt=""
                    className="w-[80px] h-[80px] object-cover rounded-md"
                  />
                  <div>
                    <div className="pl-3 text-[20px]">{selectedItem?.name}</div>
                    <h4 className="pl-3 text-[20px]">
                      Rs.{selectedItem?.discountPrice} x {selectedItem?.qty}
                    </h4>
                  </div>
                </div>

                <br />
                <br />

                {/* ratings */}
                <h5 className="pl-3 text-[20px] font-[500]">
                  Rate this product <span className="text-red-500">*</span>
                </h5>
                <div className="flex w-full ml-2 pt-1">
                  {[1, 2, 3, 4, 5].map((i) =>
                    rating >= i ? (
                      <AiFillStar
                        key={i}
                        className="mr-1 cursor-pointer"
                        color="rgb(246,186,0)"
                        size={25}
                        onClick={() => setRating(i)}
                      />
                    ) : (
                      <AiOutlineStar
                        key={i}
                        className="mr-1 cursor-pointer"
                        color="rgb(246,186,0)"
                        size={25}
                        onClick={() => setRating(i)}
                      />
                    ),
                  )}
                </div>
                <br />
                <div className="w-full ml-3">
                  <label className="block text-[20px] font-[500]">
                    Write your review
                    <span className="ml-1 font-[400] text-[16px] text-[#00000052]">(optional)</span>
                  </label>
                  <textarea
                    name="comment"
                    id=""
                    cols="20"
                    rows="5"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product. What did you like or dislike?"
                    className="mt-2 w-[95%] border p-2 outline-none rounded-md"
                  ></textarea>
                </div>
                <div
                  className={`${styles.button} text-white text-[20px] ml-3 mt-5 ${isReviewSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                  onClick={!isReviewSubmitting ? reviewHandler : null}
                >
                  {isReviewSubmitting ? "Submitting..." : "Submit Review"}
                </div>
              </div>
            </div>
          )}

          <div className="border-t w-full text-right mt-8">
            <h5 className="pt-3 text-[18px]">
              Total Price: <strong>Nrs.{data?.totalPrice}</strong>
            </h5>
          </div>
          <br />
          <br />
          <div className="w-full 800px:flex items-center">
            <div className="w-full 800px:w-[60%]">
              <h4 className="pt-3 text-[20px] font-[600]">Shipping Address:</h4>
              <h4 className="pt-3 text-[20px]">
                {data?.shippingAddress.address1 + " " + data?.shippingAddress.address2}
              </h4>
              <h4 className=" text-[20px]">{data?.shippingAddress.country}</h4>
              <h4 className=" text-[20px]">{data?.shippingAddress.city}</h4>
              <h4 className=" text-[20px]">{data?.user?.phoneNumber}</h4>
            </div>
            <div className="w-full 800px:w-[40%]">
              <h4 className="pt-3 text-[20px] font-[600]">Payment Info:</h4>
              <h4 className="pt-3 text-[18px]">
                Status:{" "}
                <span className={data?.paymentInfo?.status === "Succeeded" ? "text-green-500" : "text-red-500"}>
                  {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}
                </span>
              </h4>
              <h4 className="text-[18px]">Payment Method: {data?.paymentInfo?.type || "N/A"}</h4>
              <h4 className="text-[18px]">Paid At: {data?.paidAt ? new Date(data.paidAt).toLocaleString() : "N/A"}</h4>
              <br />
              {data?.status === "Delivered" && !data?.status.includes("Refund") && (
                <div className={`${styles.button} text-white`} onClick={refundHandler}>
                  Request a Refund
                </div>
              )}
            </div>
          </div>
          <br />
          <Link to="/inbox">
            <div className={`${styles.button} text-white`}>Send Message to Shop</div>
          </Link>
          <br />
          <br />
        </>
      )}
    </div>
  )
}

export default UserOrderDetails

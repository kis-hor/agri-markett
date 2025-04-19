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
import { TiStarFullOutline } from "react-icons/ti"

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [rating, setRating] = useState(1)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { id } = useParams()

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id))
  }, [dispatch, user._id])

  const data = orders && orders.find((item) => item._id === id)

  const reviewHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axios.put(
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

      toast.success("Review added successfully!")
      dispatch(getAllOrdersOfUser(user._id))
      setComment("")
      setRating(1)
      setOpen(false)
      setSelectedItem(null)
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding review")
    } finally {
      setIsLoading(false)
    }
  }

  const refundHandler = async () => {
    try {
      await axios.put(
        `${server}/order/order-refund/${id}`,
        {
          status: "Processing refund",
        },
        { withCredentials: true },
      )

      toast.success("Refund request successful!")
      dispatch(getAllOrdersOfUser(user._id))
    } catch (error) {
      toast.error(error.response.data.message)
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

      <div className="w-full flex items-center justify-between pt-6">
        <h5 className="text-[#00000084]">
          Order ID: <span>#{data?._id?.slice(0, 8)}</span>
        </h5>
        <h5 className="text-[#00000084]">
          Placed on: <span>{data?.createdAt?.slice(0, 10)}</span>
        </h5>
      </div>

      {/* order items */}
      <br />
      <br />

      {/* Order status tracker */}
      <div className="w-full mb-8">
        <h4 className="text-[20px] font-[600] mb-4">Order Status</h4>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className={`h-full rounded-full ${
              data?.status === "Delivered"
                ? "bg-green-500"
                : data?.status === "Processing"
                  ? "bg-blue-500 w-1/2"
                  : "bg-yellow-500 w-1/4"
            }`}
            style={{
              width: data?.status === "Delivered" ? "100%" : data?.status === "Processing" ? "50%" : "25%",
            }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span
            className={
              data?.status === "Processing" || data?.status === "Delivered" ? "text-green-600 font-semibold" : ""
            }
          >
            Ordered
          </span>
          <span
            className={
              data?.status === "Processing" || data?.status === "Delivered" ? "text-green-600 font-semibold" : ""
            }
          >
            Processing
          </span>
          <span className={data?.status === "Delivered" ? "text-green-600 font-semibold" : ""}>Delivered</span>
        </div>
      </div>

      {data &&
        data?.cart.map((item, index) => (
          <div className="w-full flex items-start mb-5 border-b pb-5" key={index}>
            <img src={`${item.images[0]?.url}`} alt="" className="w-[80px] h-[80px]" />
            <div className="w-full pl-4">
              <h5 className="text-[20px] font-[600]">{item.name}</h5>
              <h5 className="text-[18px] font-[500]">
                Rs. {item.discountPrice} x {item.qty}
              </h5>

              {/* Review section */}
              {data?.status === "Delivered" ? (
                item.isReviewed ? (
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 mr-2 flex items-center">
                      <TiStarFullOutline className="mr-1" /> Reviewed
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center mt-2">
                    <button
                      className="bg-black rounded-sm text-white px-3 py-1 text-sm"
                      onClick={() => {
                        setOpen(true)
                        setSelectedItem(item)
                      }}
                    >
                      Write a Review
                    </button>
                  </div>
                )
              ) : null}
            </div>
          </div>
        ))}

      {/* review popup */}
      {open && (
        <div className="fixed top-0 left-0 w-full h-screen bg-[#0005] z-50 flex items-center justify-center">
          <div className="w-[90%] 800px:w-[60%] h-[90vh] bg-white rounded-md shadow p-4 overflow-y-auto">
            <div className="w-full flex justify-end">
              <RxCross1 size={25} onClick={() => setOpen(false)} className="cursor-pointer" />
            </div>
            <h2 className="text-[25px] font-[500] text-center">Add a Review</h2>
            <br />
            <div className="w-full flex">
              <img src={`${selectedItem?.images[0]?.url}`} alt="" className="w-[80px] h-[80px]" />
              <div className="pl-3">
                <h4 className="text-[20px] font-[500]">{selectedItem?.name}</h4>
                <h4 className="text-[20px] font-[500]">
                  Rs. {selectedItem?.discountPrice} x {selectedItem?.qty}
                </h4>
              </div>
            </div>

            <br />
            <br />

            {/* ratings */}
            <h5 className="text-[18px] font-[500] mb-2">
              Give a Rating <span className="text-red-500">*</span>
            </h5>
            <div className="flex w-full ml-2 pb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} onClick={() => setRating(i)}>
                  {rating >= i ? (
                    <AiFillStar size={25} className="mr-1 cursor-pointer" color="rgb(246,186,0)" />
                  ) : (
                    <AiOutlineStar size={25} className="mr-1 cursor-pointer" color="rgb(246,186,0)" />
                  )}
                </div>
              ))}
            </div>

            <div className="w-full">
              <label className="block text-[18px] font-[500]">
                Write a comment
                <span className="ml-1 font-[400] text-[16px] text-[#00000052]">(optional)</span>
              </label>
              <textarea
                name="comment"
                id=""
                cols="20"
                rows="5"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your experience with this product?"
                className="mt-2 w-full border p-2 outline-none resize-none"
              ></textarea>
            </div>
            <div className="w-full flex justify-center">
              <button
                className={`${styles.button} text-white text-[18px] mt-5 !h-[45px] !rounded-[5px]`}
                onClick={reviewHandler}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t w-full text-right">
        <h5 className="pt-3 text-[18px]">
          Total Price: <strong>Rs. {data?.totalPrice}</strong>
        </h5>
      </div>
      <br />
      <br />
      <div className="w-full 800px:flex items-center">
        <div className="w-full 800px:w-[60%]">
          <h4 className="pt-3 text-[20px] font-[600]">Shipping Address:</h4>
          <h4 className="pt-3 text-[20px]">{data?.shippingAddress.address1 + " " + data?.shippingAddress.address2}</h4>
          <h4 className=" text-[20px]">{data?.shippingAddress.country}</h4>
          <h4 className=" text-[20px]">{data?.shippingAddress.city}</h4>
          <h4 className=" text-[20px]">{data?.user?.phoneNumber}</h4>
        </div>
        <div className="w-full 800px:w-[40%]">
          <h4 className="pt-3 text-[20px]">Payment Info:</h4>
          <h4>Status: {data?.paymentInfo?.status ? data?.paymentInfo?.status : "Not Paid"}</h4>
          {data?.status === "Delivered" && (
            <div className={`${styles.button} text-white`} onClick={refundHandler}>
              Request a Refund
            </div>
          )}
        </div>
      </div>
      <br />
      <Link to="/profile">
        <div className={`${styles.button} text-white`}>Back to Orders</div>
      </Link>
    </div>
  )
}

export default UserOrderDetails

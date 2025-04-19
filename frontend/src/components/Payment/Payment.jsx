"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import axios from "axios"
import { server } from "../../server"
import { toast } from "react-toastify"
import { FaMoneyBillWave } from "react-icons/fa"
import Loader from "../Layout/Loader"

const Payment = () => {
  const [orderData, setOrderData] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const { user } = useSelector((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"))
    setOrderData(orderData)

    // Fetch available payment methods
    const fetchPaymentMethods = async () => {
      try {
        const { data } = await axios.get(`${server}/payment/methods`)
        setPaymentMethods(data.paymentMethods)
      } catch (error) {
        toast.error("Failed to load payment methods")
      }
    }

    fetchPaymentMethods()
  }, [])

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
    subTotalPrice: orderData?.subTotalPrice,
    shipping: orderData?.shipping,
    discountPrice: orderData?.discountPrice,
  }

  // eSewa Payment Handler
  const esewaPaymentHandler = async () => {
    try {
      setLoading(true)
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      }

      const response = await axios.post(`${server}/payment/process`, order, config)
      const { paymentData, esewaUrl, orderId } = response.data

      // Store order ID for tracking
      localStorage.setItem("currentOrderId", orderId)

      const form = document.createElement("form")
      form.method = "POST"
      form.action = esewaUrl

      Object.keys(paymentData).forEach((key) => {
        const hiddenField = document.createElement("input")
        hiddenField.type = "hidden"
        hiddenField.name = key
        hiddenField.value = paymentData[key]
        form.appendChild(hiddenField)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      setLoading(false)
      toast.error(error.response?.data?.message || "Error initiating eSewa payment")
    }
  }

  // Cash on Delivery Handler
  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    }

    order.paymentInfo = {
      type: "Cash On Delivery",
    }

    try {
      await axios.post(`${server}/order/create-order`, order, config).then((res) => {
        setOpen(false)
        navigate("/order/success")
        toast.success("Order successful!")
        localStorage.setItem("cartItems", JSON.stringify([]))
        localStorage.setItem("latestOrder", JSON.stringify([]))
        setLoading(false)
      })
    } catch (error) {
      setLoading(false)
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  // Check payment status
  const checkPaymentStatus = async (orderId) => {
    try {
      const { data } = await axios.get(`${server}/payment/status-check/${orderId}`)
      if (data.status === "COMPLETE") {
        navigate("/order/success")
        localStorage.setItem("cartItems", JSON.stringify([]))
        localStorage.setItem("latestOrder", JSON.stringify([]))
      }
    } catch (error) {
      console.error("Payment status check failed:", error)
    }
  }

  return (
    <div className="w-full flex flex-col items-center py-8">
      {loading ? (
        <Loader />
      ) : (
        <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
          <div className="w-full 800px:w-[65%]">
            <PaymentInfo
              user={user}
              open={open}
              setOpen={setOpen}
              esewaPaymentHandler={esewaPaymentHandler}
              cashOnDeliveryHandler={cashOnDeliveryHandler}
              paymentMethods={paymentMethods}
            />
          </div>
          <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
            <CartData orderData={orderData} />
          </div>
        </div>
      )}
    </div>
  )
}

const PaymentInfo = ({ user, open, setOpen, esewaPaymentHandler, cashOnDeliveryHandler, paymentMethods }) => {
  const [select, setSelect] = useState(1) // 1 for eSewa, 2 for Cash on Delivery

  return (
    <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
      <div className="flex flex-col gap-5">
        <h3 className="text-[18px] font-[600] text-[#000000b1] pb-3 border-b">Select Payment Method</h3>

        {/* eSewa Payment */}
        <div className="w-full bg-white rounded-md shadow-md p-4 relative overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex w-full pb-3 border-b mb-2 items-center">
            <div
              className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center cursor-pointer"
              onClick={() => setSelect(1)}
            >
              {select === 1 ? <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" /> : null}
            </div>
            <div className="flex items-center ml-3">
              {/* <SiEsewa className="text-[#60BB46] text-3xl mr-2" /> */}
              <h4 className="text-[18px] font-[600] text-[#000000b1]">Pay with eSewa</h4>
            </div>
            <div className="absolute right-4 top-4 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Recommended
            </div>
          </div>

          {select === 1 && (
            <div className="w-full mt-4">
              <p className="text-gray-600 mb-4">
                Pay securely using your eSewa account. You will be redirected to eSewa's secure payment gateway.
              </p>
              <button
                className="w-full py-3 px-4 bg-[#60BB46] hover:bg-[#4e9e39] text-white rounded-md font-medium flex items-center justify-center"
                onClick={esewaPaymentHandler}
              >
                {/* <SiEsewa className="mr-2" /> */}
                Pay with eSewa
              </button>
            </div>
          )}
        </div>

        {/* Cash on Delivery */}
        <div className="w-full bg-white rounded-md shadow-md p-4 hover:shadow-lg transition-shadow">
          <div className="flex w-full pb-3 border-b mb-2 items-center">
            <div
              className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center cursor-pointer"
              onClick={() => setSelect(2)}
            >
              {select === 2 ? <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" /> : null}
            </div>
            <div className="flex items-center ml-3">
              <FaMoneyBillWave className="text-gray-700 text-2xl mr-2" />
              <h4 className="text-[18px] font-[600] text-[#000000b1]">Cash on Delivery</h4>
            </div>
          </div>

          {select === 2 && (
            <div className="w-full mt-4">
              <p className="text-gray-600 mb-4">
                Pay when you receive your order. Please have the exact amount ready for our delivery personnel.
              </p>
              <form className="w-full" onSubmit={cashOnDeliveryHandler}>
                <input
                  type="submit"
                  value="Place Order"
                  className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-md font-medium cursor-pointer"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping?.toFixed(2)
  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8 shadow-md">
      <h3 className="text-[18px] font-[600] text-[#000000b1] pb-3 border-b">Order Summary</h3>
      <div className="flex justify-between mt-4">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Subtotal:</h3>
        <h5 className="text-[18px] font-[600]">Rs.{orderData?.subTotalPrice?.toFixed(2)}</h5>
      </div>
      <div className="flex justify-between mt-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Shipping:</h3>
        <h5 className="text-[18px] font-[600]">${shipping}</h5>
      </div>
      {orderData?.discountPrice > 0 && (
        <div className="flex justify-between mt-3">
          <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
          <h5 className="text-[18px] font-[600] text-red-500">-Rs.{orderData.discountPrice?.toFixed(2)}</h5>
        </div>
      )}
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
        <h3 className="text-[18px] font-[600] text-[#000000a4]">Total:</h3>
        <h5 className="text-[20px] font-[600] text-[#000000]">Rs.{orderData?.totalPrice?.toFixed(2)}</h5>
      </div>

      <div className="mt-8 bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address:</h4>
        {orderData?.shippingAddress && (
          <div className="text-gray-600 text-sm">
            <p>{orderData.shippingAddress.address1}</p>
            {orderData.shippingAddress.address2 && <p>{orderData.shippingAddress.address2}</p>}
            <p>
              {orderData.shippingAddress.city}, {orderData.shippingAddress.country}
            </p>
            <p>ZIP: {orderData.shippingAddress.zipCode}</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500 text-center">
          By completing your purchase, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default Payment

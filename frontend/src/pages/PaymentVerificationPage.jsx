"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { server } from "../server"
import { toast } from "react-toastify"
import Loader from "../components/Layout/Loader"
import Header from "../components/Layout/Header"
import Footer from "../components/Layout/Footer"

const PaymentVerificationPage = () => {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("Processing")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Get query parameters from URL
    const queryParams = new URLSearchParams(location.search)
    const response = queryParams.get("response")
    const failureStatus = queryParams.get("status")

    // Handle failure status directly from URL
    if (failureStatus === "failure") {
      setStatus("Failed")
      toast.error("Payment failed! Please try again.")
      setTimeout(() => {
        navigate("/order/failure")
      }, 2000)
      setLoading(false)
      return
    }

    // If no response, check for stored order ID
    if (!response) {
      const orderId = localStorage.getItem("currentOrderId")
      if (orderId) {
        checkPaymentStatus(orderId)
      } else {
        setStatus("Failed")
        toast.error("No payment information found!")
        setTimeout(() => {
          navigate("/checkout")
        }, 2000)
        setLoading(false)
      }
      return
    }

    // Verify payment with backend
    const verifyPayment = async () => {
      try {
        const { data } = await axios.get(`${server}/payment/verify?response=${response}`)
        if (data.success) {
          setStatus("Success")
          toast.success("Payment successful!")
          localStorage.removeItem("cartItems")
          localStorage.removeItem("latestOrder")
          localStorage.removeItem("currentOrderId")
          setTimeout(() => {
            navigate("/order/success")
          }, 2000)
        } else {
          setStatus("Failed")
          toast.error(data.message || "Payment verification failed!")
          setTimeout(() => {
            navigate("/order/failure")
          }, 2000)
        }
      } catch (error) {
        console.error("Verification Error:", error)
        setStatus("Failed")
        toast.error("Payment verification failed! Please contact support.")
        setTimeout(() => {
          navigate("/order/failure")
        }, 2000)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [navigate, location.search])

  // Function to check payment status for pending transactions
  const checkPaymentStatus = async (orderId) => {
    try {
      const { data } = await axios.get(`${server}/payment/status-check/${orderId}`)
      if (data.status === "COMPLETE") {
        setStatus("Success")
        toast.success("Payment successful!")
        localStorage.removeItem("cartItems")
        localStorage.removeItem("latestOrder")
        localStorage.removeItem("currentOrderId")
        setTimeout(() => {
          navigate("/order/success")
        }, 2000)
      } else if (["PENDING", "AMBIGUOUS"].includes(data.status)) {
        setStatus("Pending")
        toast.info("Your payment is still processing. We'll update you soon.")
        setTimeout(() => {
          navigate("/profile?active=2")
        }, 3000)
      } else {
        setStatus("Failed")
        toast.error("Payment failed! Please try again.")
        setTimeout(() => {
          navigate("/order/failure")
        }, 2000)
      }
    } catch (error) {
      console.error("Status Check Error:", error)
      setStatus("Failed")
      toast.error("Could not verify payment status!")
      setTimeout(() => {
        navigate("/order/failure")
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#f6f9fc]">
      <Header />
      <div className="max-w-5xl mx-auto py-8 px-4 text-center min-h-[60vh] flex items-center justify-center">
        {loading ? (
          <div className="w-full">
            <Loader />
            <h5 className="text-center mt-4 text-lg">Verifying your payment...</h5>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="mb-4">
              {status === "Success" && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {status === "Failed" && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {status === "Pending" && (
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-yellow-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {status === "Success" && "Payment Successful!"}
              {status === "Failed" && "Payment Failed!"}
              {status === "Pending" && "Payment Processing..."}
            </h2>
            <p className="text-gray-600 mb-6">
              {status === "Success" && "Your order has been placed successfully."}
              {status === "Failed" && "There was a problem processing your payment."}
              {status === "Pending" && "Your payment is being processed. We'll update you soon."}
            </p>
            <div className="text-sm text-gray-500">
              {status === "Success" && "You will be redirected to the order success page."}
              {status === "Failed" && "You will be redirected to try again."}
              {status === "Pending" && "You will be redirected to your orders page."}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default PaymentVerificationPage

"use client"

import { useState, useEffect } from "react"
import styles from "../../styles/styles"
import { Country, State } from "country-state-city"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import axios from "axios"
import { server } from "../../server"
import { toast } from "react-toastify"
import CheckoutSteps from "./CheckoutSteps" // Import the steps component

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(1) // 1 = shipping, 2 = payment
  const { user } = useSelector((state) => state.user)
  const { cart } = useSelector((state) => state.cart)
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [userInfo, setUserInfo] = useState(false)
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [zipCode, setZipCode] = useState(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponCodeData, setCouponCodeData] = useState(null)
  const [discountPrice, setDiscountPrice] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Calculate prices
  const subTotalPrice = cart.reduce((acc, item) => acc + item.qty * item.discountPrice, 0)
  const shipping = subTotalPrice * 0.1
  const discountPercentenge = couponCodeData ? discountPrice : ""
  const totalPrice = couponCodeData
    ? (subTotalPrice + shipping - discountPercentenge).toFixed(2)
    : (subTotalPrice + shipping).toFixed(2)

  // Handle shipping info submission
  const submitShippingInfo = () => {
    if (!address1 || !address2 || !zipCode || !country || !city) {
      toast.error("Please fill all shipping fields!")
      return
    }
    setActiveStep(2) // Move to payment step
  }

  // eSewa Payment Handler
  const handleEsewaPayment = async () => {
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty!")
      return
    }

    const shippingAddress = { address1, address2, zipCode, country, city }
    const orderData = {
      cart,
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice: discountPrice || 0,
      shippingAddress,
      user,
    }

    try {
      const response = await axios.post(`${server}/payment/process`, orderData)
      const { paymentData, esewaUrl, orderId } = response.data

      // Store the order ID in localStorage for verification fallback
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
      toast.error(error.response?.data?.message || "Error initiating eSewa payment")
    }
  }

  // Coupon Code Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = couponCode

    try {
      const res = await axios.get(`${server}/coupon/get-coupon-value/${name}`)
      const shopId = res.data.couponCode?.shopId
      const couponCodeValue = res.data.couponCode?.value

      if (res.data.couponCode) {
        const isCouponValid = cart.filter((item) => item.shopId === shopId)
        if (isCouponValid.length === 0) {
          toast.error("Coupon code is not valid for this shop")
          setCouponCode("")
        } else {
          const eligiblePrice = isCouponValid.reduce((acc, item) => acc + item.qty * item.discountPrice, 0)
          const discount = (eligiblePrice * couponCodeValue) / 100
          setDiscountPrice(discount)
          setCouponCodeData(res.data.couponCode)
          setCouponCode("")
        }
      } else {
        toast.error("Coupon code doesn't exist!")
        setCouponCode("")
      }
    } catch (error) {
      toast.error("Error applying coupon code")
    }
  }

  return (
    <div className="w-full flex flex-col items-center py-8">


      {activeStep === 1 && (
        <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
          <div className="w-full 800px:w-[65%]">
            <ShippingInfo
              user={user}
              country={country}
              setCountry={setCountry}
              city={city}
              setCity={setCity}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              address1={address1}
              setAddress1={setAddress1}
              address2={address2}
              setAddress2={setAddress2}
              zipCode={zipCode}
              setZipCode={setZipCode}
            />
          </div>
          <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
            <CartData
              handleSubmit={handleSubmit}
              totalPrice={totalPrice}
              shipping={shipping}
              subTotalPrice={subTotalPrice}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              discountPercentenge={discountPercentenge}
            />
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="w-full text-center mt-8">
          <button className={`${styles.button} w-[150px] 800px:w-[280px]`} onClick={submitShippingInfo}>
            Continue to Payment
          </button>
        </div>
      )}

      {activeStep === 2 && (
        <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
          <div className="w-full 800px:w-[65%]">
            <div className="w-full 800px:w-[95%] bg-white rounded-md p-5 pb-8">
              <h5 className="text-[18px] font-[500]">Payment Method</h5>
              <div className="w-full flex flex-col mt-4">
                <div className="w-full flex items-center justify-between p-4 border rounded-md mb-4">
                  <div className="flex items-center">
                    <input type="radio" name="payment" checked className="mr-2" />
                    <span>Pay with eSewa</span>
                  </div>
                  <img src="https://www.drupal.org/files/project-images/esewa.png" alt="eSewa" className="h-8" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
            <CartData
              handleSubmit={handleSubmit}
              totalPrice={totalPrice}
              shipping={shipping}
              subTotalPrice={subTotalPrice}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              discountPercentenge={discountPercentenge}
            />
            <div className={`${styles.button} w-full mt-4`} onClick={handleEsewaPayment}>
              <h5 className="text-white">Pay with eSewa</h5>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ShippingInfo Component (unchanged)
const ShippingInfo = ({
  user,
  country,
  setCountry,
  city,
  setCity,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  setZipCode,
}) => {
  return (
    <div className="w-full 800px:w-[95%] bg-white rounded-md p-5 pb-8">
      <h5 className="text-[18px] font-[500]">Shipping Address</h5>
      <br />
      <form>
        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Full Name</label>
            <input type="text" value={user && user.name} required className={`${styles.input} !w-[95%]`} />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Email Address</label>
            <input type="email" value={user && user.email} required className={`${styles.input}`} />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Phone Number</label>
            <input type="number" required value={user && user.phoneNumber} className={`${styles.input} !w-[95%]`} />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Zip Code</label>
            <input
              type="number"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              className={`${styles.input}`}
            />
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Country</label>
            <select
              className="w-[95%] border h-[40px] rounded-[5px]"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option className="block pb-2" value="">
                Choose your country
              </option>
              {Country &&
                Country.getAllCountries().map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">City</label>
            <select
              className="w-[95%] border h-[40px] rounded-[5px]"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option className="block pb-2" value="">
                Choose your City
              </option>
              {State &&
                State.getStatesOfCountry(country).map((item) => (
                  <option key={item.isoCode} value={item.isoCode}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="w-full flex pb-3">
          <div className="w-[50%]">
            <label className="block pb-2">Address1</label>
            <input
              type="address"
              required
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              className={`${styles.input} !w-[95%]`}
            />
          </div>
          <div className="w-[50%]">
            <label className="block pb-2">Address2</label>
            <input
              type="address"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              required
              className={`${styles.input}`}
            />
          </div>
        </div>
      </form>
      <h5 className="text-[18px] cursor-pointer inline-block" onClick={() => setUserInfo(!userInfo)}>
        Choose From saved address
      </h5>
      {userInfo && (
        <div>
          {user &&
            user.addresses.map((item, index) => (
              <div className="w-full flex mt-1" key={index}>
                <input
                  type="checkbox"
                  className="mr-3"
                  value={item.addressType}
                  onClick={() =>
                    setAddress1(item.address1) ||
                    setAddress2(item.address2) ||
                    setZipCode(item.zipCode) ||
                    setCountry(item.country) ||
                    setCity(item.city)
                  }
                />
                <h2>{item.addressType}</h2>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// CartData Component (unchanged)
const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentenge,
}) => {
  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3>
        <h5 className="text-[18px] font-[600]">Rs.{subTotalPrice}</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">shipping:</h3>
        <h5 className="text-[18px] font-[600]">Rs.{shipping.toFixed(2)}</h5>
      </div>
      <br />
      <div className="flex justify-between border-b pb-3">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          - {discountPercentenge ? "Rs." + discountPercentenge.toString() : null}
        </h5>
      </div>
      <h5 className="text-[18px] font-[600] text-end pt-3">Rs.{totalPrice}</h5>
      <br />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={`${styles.input} h-[40px] pl-2`}
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          required
        />
        <input
          className={`w-full h-[40px] border border-[#f63b60] text-center text-[#f63b60] rounded-[3px] mt-8 cursor-pointer`}
          required
          value="Apply code"
          type="submit"
        />
      </form>
    </div>
  )
}

export default Checkout

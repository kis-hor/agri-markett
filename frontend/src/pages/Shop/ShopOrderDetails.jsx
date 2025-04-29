import React, { useEffect } from "react"
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader"
import OrderDetails from "../../components/Shop/OrderDetails"
import Footer from "../../components/Layout/Footer"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import Loader from "../../components/Layout/Loader"

const ShopOrderDetails = () => {
  const { seller, isLoading } = useSelector((state) => state.seller)
  const navigate = useNavigate()

  useEffect(() => {
    if (!seller) {
      navigate("/shop-login")
    }
  }, [seller, navigate])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div>
      <DashboardHeader />
      <OrderDetails />
      <Footer />
    </div>
  )
}

export default ShopOrderDetails
import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import EditProduct from "../../components/Shop/EditProduct";

const ShopEditProduct = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={3} />
        </div>
        <div className="w-full justify-center flex">
          <div className="w-full max-w-[1200px]">
            <EditProduct />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopEditProduct 
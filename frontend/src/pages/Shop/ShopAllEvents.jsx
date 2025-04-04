import React from 'react';
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader';
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar';
import AllBlogs from "../../components/Shop/AllBlogs"; // Assuming you have an AllBlogs component

const ShopAllBlogs = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={6} /> {/* Assuming blogs might be the 6th item in your sidebar */}
        </div>
        <div className="w-full justify-center flex">
          <AllBlogs />
        </div>
      </div>
    </div>
  );
};

export default ShopAllBlogs;
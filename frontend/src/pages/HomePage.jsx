import React, { useEffect } from 'react'
import Header from "../components/Layout/Header";
import Hero from "../components/Route/Hero/Hero";
import Categories from "../components/Route/Categories/Categories";
import FeaturedProduct from "../components/Route/FeaturedProduct/FeaturedProduct";
import Blogs from "../components/Route/Blogs/Blogs";
import Newsletter from "../components/Route/Newsletter/Newsletter.jsx";
import Footer from "../components/Layout/Footer";
import { toast } from "react-toastify";

const HomePage = () => {
  useEffect(() => {
    console.log("HomePage mounted, checking localStorage");
    const showLoginSuccess = localStorage.getItem('showLoginSuccess');
    console.log("showLoginSuccess value:", showLoginSuccess);
    
    if (showLoginSuccess === 'true') {
      console.log("Showing success toast");
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.log("Clearing localStorage flag");
      localStorage.removeItem('showLoginSuccess');
    }
  }, []);

  return (
    <div>
        <Header activeHeading={1} />
        <Hero />
        <Categories />
        <FeaturedProduct />
        <Blogs />
        <Newsletter />
        <Footer />
    </div>
  )
}

export default HomePage
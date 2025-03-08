import React from 'react'
import Header from "../components/Layout/Header";
import Hero from "../components/Route/Hero/Hero";
import Categories from "../components/Route/Categories/Categories";
import FeaturedProduct from "../components/Route/FeaturedProduct/FeaturedProduct";
import Blogs from "../components/Route/Blogs/Blogs";
import Newsletter from "../components/Route/Newsletter/Newsletter.jsx";
import Footer from "../components/Layout/Footer";

const HomePage = () => {
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
import React from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";

const Hero = () => {
  return (
    <div className="relative bg-green-700 min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://design-system.agriculture.gov.au/img/placeholder/hero-banner.jpeg" 
          alt="Farm background" 
          className="w-full h-full object-cover opacity-25"
        />
      </div>

      {/* Content */}
      <div className={`${styles.section} w-[90%] lg:w-[60%] relative z-10 text-white`}>
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
            Fresh Seeds for Your Garden
          </h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow-md">
            Premium quality agricultural products for farmers and home gardeners.
          </p>
          <div className="flex space-x-4">
            <Link to="/products">
              <button className="bg-white text-green-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition">
                SHOP NOW
              </button>
            </Link>
            <button className="border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-green-800 transition">
              EXPLORE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

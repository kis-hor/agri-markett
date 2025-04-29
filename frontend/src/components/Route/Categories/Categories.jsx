import React from "react";
import { useNavigate } from "react-router-dom";
import { brandingData, categoriesData } from "../../../static/data";
import styles from "../../../styles/styles";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-green-50 py-12">
      {/* Branding Section */}
      {/* <div className={`${styles.section} hidden sm:block`}>
        <div className="branding my-8 flex justify-between w-full shadow-md bg-white p-6 rounded-lg border border-green-200">
          {brandingData?.map((item, index) => (
            <div className="flex items-start" key={index}>
              {item.icon}
              <div className="px-3">
                <h3 className="font-semibold text-green-700 text-base md:text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.Description}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Categories Section */}
      <div className={`${styles.section} bg-white p-8 rounded-lg shadow-md border border-green-200`} id="categories">
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Explore Our Categories</h2>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categoriesData?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-green-100 rounded-lg shadow-md cursor-pointer hover:bg-green-200 transition"
              onClick={() => navigate(`/products?category=${item.title}`)}
            >
              <h5 className="text-green-800 font-semibold text-lg">{item.title}</h5>
              <img src={item.image_Url} className="w-[100px] object-cover rounded-md" alt={item.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;

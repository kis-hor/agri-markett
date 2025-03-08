import React from "react";
import styles from "../../../styles/styles";
import { blogData } from "../../../static/data";

const Blogs = () => {
  return (
    <div className={`${styles.section}`}>
      <div className={`${styles.heading}`}>
        <h1 className="text-green-700">Latest Blogs</h1>
      </div>
      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 lg:grid-cols-3 lg:gap-[25px] xl:gap-[30px] mb-12">
        {blogData.slice(0, 3).map((item, index) => (
          <div
            key={index}
            className="bg-white border border-green-300 rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={item.image_Url[0].url}
              alt={item.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-green-800">{item.title}</h2>
              <p className="text-gray-600 text-sm mt-2">{item.description.substring(0, 100)}...</p>
              <div className="flex items-center mt-3">
                <img
                  src={item.author.avatar.url}
                  alt={item.author.name}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <p className="text-green-700 text-sm">{item.author.name}</p>
              </div>
              <p className="text-gray-500 text-xs mt-1">{item.publish_date}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition mb-4">
          View More
        </button>
      </div>
    </div>
  );
};

export default Blogs;

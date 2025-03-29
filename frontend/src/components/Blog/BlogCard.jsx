import React from "react";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const BlogCard = ({ active, data }) => {
  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className={`w-full block bg-white rounded-lg ${
        active ? "unset" : "mb-12"
      } lg:flex p-2`}
    >
      <div className="w-full lg:w-[50%] m-auto">
        <img 
          src={`${data.featuredImage?.url}`} 
          alt={data.title}
          className="w-full h-auto object-cover"
        />
      </div>
      <div className="w-full lg:w-[50%] flex flex-col justify-center p-4">
        <h2 className={`${styles.productTitle}`}>{data.title}</h2>
        <p className="text-gray-600 mb-2">
          By {data.author} | {formatDate(data.createdAt)}
        </p>
        <p className="text-gray-700 mb-4">
          {data.content.length > 150 
            ? `${data.content.substring(0, 150)}...` 
            : data.content
          }
        </p>
        <div className="flex items-center justify-between">
          <span className="font-[400] text-[17px] text-[#44a55e]">
            {data.views} views
          </span>
          <Link to={`/blog/${data._id}`}>
            <div className={`${styles.button} text-[#fff]`}>
              Read More
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
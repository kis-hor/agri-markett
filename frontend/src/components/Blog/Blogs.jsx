import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from '../../styles/styles';
import BlogCard from "./BlogCard";

const Blogs = () => {
  const { allBlogs, isLoading } = useSelector((state) => state.blogs); // Assuming you have a blogs slice in redux
  
  return (
    <div>
      {!isLoading && (
        <div className={`${styles.section}`}>
          <div className={`${styles.heading}`}>
            <h1>Latest Blog Posts</h1>
          </div>

          <div className="w-full grid">
            {allBlogs.length !== 0 && (
              <BlogCard data={allBlogs[0]} /> // Showing the latest blog post
            )}
            <h4>
              {allBlogs?.length === 0 && 'No Blog Posts Available!'}
            </h4>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
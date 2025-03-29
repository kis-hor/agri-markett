import React from "react";
import { useSelector } from "react-redux";
import BlogCard from "../components/Blog/BlogCard"; // Assuming you have a BlogCard component
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";

const BlogsPage = () => {
  const { allBlogs, isLoading } = useSelector((state) => state.blogs); // Assuming your blog data is in a 'blogs' reducer
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={5} /> {/* Assuming Blogs might be the 5th heading */}
          <BlogCard active={true} data={allBlogs && allBlogs[0]} />
        </div>
      )}
    </>
  );
};

export default BlogsPage;
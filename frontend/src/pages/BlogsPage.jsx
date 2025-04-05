import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import BlogCard from "../components/Blog/BlogCard";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import { getAllBlogs } from "../redux/actions/blog";

const BlogsPage = () => {
  const dispatch = useDispatch();
  const { allBlogs, isLoading } = useSelector((state) => state.blogs);

  useEffect(() => {
    dispatch(getAllBlogs());
  }, [dispatch]);

  return (
    <>
      <Header activeHeading={5} />
      {isLoading ? (
        <Loader />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Latest Blog Posts</h1>
          {allBlogs && allBlogs.length > 0 ? (
            <div className="grid gap-8">
              {allBlogs.map((blog) => (
                <BlogCard key={blog._id} data={blog} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No blog posts available</p>
          )}
        </div>
      )}
    </>
  );
};

export default BlogsPage;
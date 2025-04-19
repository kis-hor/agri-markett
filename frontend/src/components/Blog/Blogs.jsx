"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import styles from "../../styles/styles"
import { blogData } from "../../static/data"
import BlogCard from "./BlogCard"

const Blogs = () => {
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    // Get the first 3 blogs from the data
    const featuredBlogs = blogData.slice(0, 3)
    setBlogs(featuredBlogs)
  }, [])

  return (
    <div className={`${styles.section} my-12`}>
      <div className="text-center mb-10">
        <h2 className={`${styles.heading} text-[#000000] font-[600] text-[2rem] mb-2`}>Latest from Our Blog</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay updated with the latest trends, tips, and insights in agriculture and farming
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:gap-5 mb-12">
        {blogs &&
          blogs.length > 0 &&
          blogs.map((blog, index) => <BlogCard key={blog.id} data={blog} active={index === 0} />)}
      </div>

      <div className="flex justify-center">
        <Link to="/blogs">
          <div className={`${styles.button} text-[#fff] bg-[#3a9e1e] hover:bg-[#2c7d13]`}>View All Posts</div>
        </Link>
      </div>
    </div>
  )
}

export default Blogs

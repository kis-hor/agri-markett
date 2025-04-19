"use client"

import { useEffect, useState } from "react"
import { blogData } from "../static/data"
import Header from "../components/Layout/Header"
import Footer from "../components/Layout/Footer"
import BlogCard from "../components/Blog/BlogCard"
import styles from "../styles/styles"

const BlogPage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    // Simulate loading from an API
    setLoading(true)
    setTimeout(() => {
      setBlogs(blogData)
      setLoading(false)
    }, 500)
  }, [])

  // Get unique categories from blog data
  const categories = ["All", ...new Set(blogData.map((blog) => blog.category))]

  // Filter blogs by category
  const filteredBlogs = selectedCategory === "All" ? blogs : blogs.filter((blog) => blog.category === selectedCategory)

  return (
    <div>
      <Header activeHeading={3} />
      <div className={`${styles.section} my-8`}>
        <h1 className="text-3xl font-bold text-center mb-8">AgriMarket Blog</h1>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? "bg-[#3a9e1e] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured blog */}
        {!loading && filteredBlogs.length > 0 && (
          <div className="mb-12">
            <BlogCard data={filteredBlogs[0]} active={true} />
          </div>
        )}

        {/* Blog list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a9e1e]"></div>
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {filteredBlogs.slice(1).map((blog) => (
              <BlogCard key={blog.id} data={blog} active={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium text-gray-600">No blogs found in this category</h2>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-4 px-6 py-2 bg-[#3a9e1e] text-white rounded-md hover:bg-[#2c7d13]"
            >
              View all blogs
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default BlogPage

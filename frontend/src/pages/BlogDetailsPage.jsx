"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { blogData } from "../static/data"
import Header from "../components/Layout/Header"
import Footer from "../components/Layout/Footer"
import styles from "../styles/styles"
import { AiOutlineCalendar, AiOutlineUser, AiOutlineTag, AiOutlineShareAlt } from "react-icons/ai"

const BlogDetailsPage = () => {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedBlogs, setRelatedBlogs] = useState([])

  useEffect(() => {
    setLoading(true)
    window.scrollTo(0, 0)

    // Find the blog with the matching id
    const blogPost = blogData.find((item) => item.id === Number.parseInt(id))

    if (blogPost) {
      setBlog(blogPost)

      // Find related blogs in the same category
      const related = blogData
        .filter((item) => item.category === blogPost.category && item.id !== blogPost.id)
        .slice(0, 3)

      setRelatedBlogs(related)
    }

    setLoading(false)
  }, [id])

  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div>
        <Header activeHeading={3} />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3a9e1e]"></div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div>
        <Header activeHeading={3} />
        <div className={`${styles.section} my-8 text-center`}>
          <h2 className="text-2xl font-semibold mb-4">Blog post not found</h2>
          <Link to="/blogs" className="bg-[#3a9e1e] text-white py-2 px-6 rounded-md hover:bg-[#2c7d13]">
            Back to Blogs
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Header activeHeading={3} />
      <div className={`${styles.section} my-8`}>
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-[#3a9e1e]">
            Home
          </Link>{" "}
          /
          <Link to="/blogs" className="hover:text-[#3a9e1e] mx-1">
            Blogs
          </Link>{" "}
          /<span className="text-gray-700">{blog.title}</span>
        </div>

        {/* Blog header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
          <div className="flex flex-wrap items-center text-gray-600 gap-4 mb-6">
            <div className="flex items-center">
              <AiOutlineUser className="mr-1" />
              <span>{blog.author.name}</span>
            </div>
            <div className="flex items-center">
              <AiOutlineCalendar className="mr-1" />
              <span>{formatDate(blog.publish_date)}</span>
            </div>
            <div className="flex items-center">
              <AiOutlineTag className="mr-1" />
              <span>{blog.category}</span>
            </div>
          </div>
        </div>

        {/* Featured image */}
        <div className="mb-8">
          <img
            src={blog.image_Url[0].url || "/placeholder.svg"}
            alt={blog.title}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* Blog content */}
        <div className="prose max-w-none mb-12">
          <p className="text-lg leading-relaxed mb-6">{blog.description}</p>
          <p className="text-lg leading-relaxed mb-6">
            Sustainable farming practices are essential for the future of agriculture. They help preserve soil health,
            conserve water, reduce pollution, and promote biodiversity. By adopting sustainable methods, farmers can
            ensure long-term productivity while minimizing environmental impact.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Key Benefits of Sustainable Farming</h2>
          <ul className="list-disc pl-6 mb-6">
            <li className="mb-2">Improved soil health and fertility</li>
            <li className="mb-2">Reduced water usage and pollution</li>
            <li className="mb-2">Lower greenhouse gas emissions</li>
            <li className="mb-2">Enhanced biodiversity and ecosystem services</li>
            <li className="mb-2">Better resilience to climate change</li>
          </ul>
          <p className="text-lg leading-relaxed mb-6">
            Implementing these practices requires knowledge, planning, and sometimes initial investment. However, the
            long-term benefits far outweigh the costs, both for individual farmers and for society as a whole.
          </p>
          <blockquote className="border-l-4 border-[#3a9e1e] pl-4 italic my-6">
            "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human
            beings." - Masanobu Fukuoka
          </blockquote>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2 mb-12">
          <span className="font-medium">Share:</span>
          <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <AiOutlineShareAlt />
          </button>
        </div>

        {/* Related posts */}
        {relatedBlogs.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link to={`/blog/${relatedBlog.id}`} key={relatedBlog.id} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <img
                      src={relatedBlog.image_Url[0].url || "/placeholder.svg"}
                      alt={relatedBlog.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-semibold mb-2 group-hover:text-[#3a9e1e] transition-colors">
                        {relatedBlog.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">{formatDate(relatedBlog.publish_date)}</p>
                      <p className="text-gray-700 line-clamp-2">{relatedBlog.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default BlogDetailsPage

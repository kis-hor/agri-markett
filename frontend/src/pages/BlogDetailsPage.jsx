"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import axios from "axios"
import { server } from "../server"
import Header from "../components/Layout/Header"
import Footer from "../components/Layout/Footer"
import Loader from "../components/Layout/Loader"
import { toast } from "react-toastify"
import { formatDistanceToNow } from "date-fns"

const BlogDetailsPage = () => {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const { allBlogs } = useSelector((state) => state.blogs)

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`${server}/blog/get-blog/${id}`)
        setBlog(data.blog)

        // Find related blogs with the same category
        if (allBlogs && allBlogs.length > 0) {
          const related = allBlogs.filter((item) => item._id !== id && item.category === data.blog.category).slice(0, 3)
          setRelatedBlogs(related)
        }

        setLoading(false)
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load blog details")
        setLoading(false)
      }
    }

    if (id) {
      fetchBlogDetails()
    }
  }, [id, allBlogs])

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Time ago format
  const timeAgo = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  return (
    <>
      <Header activeHeading={5} />
      {loading ? (
        <Loader />
      ) : blog ? (
        <div className="container mx-auto px-4 py-8">
          {/* Blog Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
            <div className="flex items-center text-gray-600 mb-6">
              <span className="mr-4">By {blog.author}</span>
              <span className="mr-4">•</span>
              <span>{formatDate(blog.createdAt)}</span>
              <span className="mx-4">•</span>
              <span>{blog.views} views</span>
            </div>

            {/* Featured Image */}
            <div className="mb-8">
              <img
                src={blog.featuredImage.url || "/placeholder.svg"}
                alt={blog.title}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Blog Content */}
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none mb-12">
              {/* Render content with proper formatting */}
              {blog.content.split("\n").map((paragraph, index) =>
                paragraph ? (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ) : (
                  <br key={index} />
                ),
              )}
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Images */}
            {blog.images && blog.images.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold mb-4">Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {blog.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url || "/placeholder.svg"}
                      alt={`${blog.title} - image ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Related Blogs */}
            {relatedBlogs.length > 0 && (
              <div className="border-t pt-8 mt-12">
                <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedBlogs.map((relatedBlog) => (
                    <Link to={`/blog/${relatedBlog._id}`} key={relatedBlog._id} className="block group">
                      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                        <img
                          src={relatedBlog.featuredImage.url || "/placeholder.svg"}
                          alt={relatedBlog.title}
                          className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                        />
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">
                            {relatedBlog.title}
                          </h4>
                          <p className="text-sm text-gray-500">{timeAgo(relatedBlog.createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-700">Blog post not found</h2>
          <p className="mt-4 text-gray-600">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/blogs"
            className="mt-6 inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Back to Blogs
          </Link>
        </div>
      )}
      <Footer />
    </>
  )
}

export default BlogDetailsPage

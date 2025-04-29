import styles from "../../styles/styles"
import { Link } from "react-router-dom"
import { AiOutlineCalendar, AiOutlineEye } from "react-icons/ai"

const BlogCard = ({ active, data }) => {
  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div
      className={`w-full block bg-white rounded-lg ${active ? "unset" : "mb-12"} lg:flex p-2 shadow-md hover:shadow-lg transition-shadow`}
    >
      <div className={`w-full ${active ? "lg:w-[50%]" : "lg:w-[40%]"} m-auto`}>
        <Link to={`/blog/${data.id}`}>
          <img
            src={data.image_Url[0].url || "/placeholder.svg"}
            alt={data.title}
            className="w-full h-auto object-cover rounded-lg"
          />
        </Link>
      </div>
      <div className={`w-full ${active ? "lg:w-[50%]" : "lg:w-[60%]"} flex flex-col justify-center p-4`}>
        <Link to={`/blog/${data.id}`}>
          <h2 className={`${styles.productTitle} hover:text-[#3a9e1e] transition-colors`}>{data.title}</h2>
        </Link>

        <div className="flex items-center gap-4 text-gray-600 text-sm my-2">
          <div className="flex items-center">
            <AiOutlineCalendar className="mr-1" />
            <span>{formatDate(data.publish_date)}</span>
          </div>
          <div className="flex items-center">
            <AiOutlineEye className="mr-1" />
            <span>{data.views || 0} views</span>
          </div>
        </div>

        <p className="text-gray-700 mb-4">
          {data.description.length > 200 ? `${data.description.substring(0, 200)}...` : data.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-gray-600">By {data.author.name}</span>
          <Link to={`/blog/${data.id}`}>
            <div className={`${styles.button} text-[#fff] bg-[#3a9e1e] hover:bg-[#2c7d13]`}>Read More</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BlogCard

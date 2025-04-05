import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createBlog } from "../../redux/actions/blog";


const CreateBlog = () => {
  const { seller, isSeller, isLoading } = useSelector((state) => state.seller);
  const { success, error, loading } = useSelector((state) => state.blogs || {});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
    status: "Published",
    author: seller?.name || "",
    featuredImage: null,
    images: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load seller data if not already loaded
    if (!isSeller && !isLoading) {
      navigate("/login");
      toast.error("Please login to continue");
    }
  }, [isSeller, isLoading, navigate]);

  useEffect(() => {
    if (seller?.name && !formData.author) {
      setFormData(prev => ({
        ...prev,
        author: seller.name
      }));
    }
  }, [seller, formData.author]);
    
   

  // Fix 3: Success/error handling
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Blog created successfully!");
      navigate("/dashboard-blogs");
    }
  }, [error, success, navigate, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.featuredImage) newErrors.featuredImage = "Featured image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    
    if (name === "featuredImage" && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          featuredImage: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else if (name === "images" && files.length > 0) {
      const newImages = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          newImages.push(reader.result);
          if (newImages.length === files.length) {
            setFormData(prev => ({
              ...prev,
              images: newImages
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const blogData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        status: formData.status,
        author: formData.author,
        featuredImage: formData.featuredImage,
        images: formData.images,
        shopId: seller._id
      };

      dispatch(createBlog(blogData));
    } catch (err) {
      toast.error("Failed to prepare blog data");
      console.error("Submission error:", err);
    }
  };

  if (!seller) {
    return <div className="p-4 text-center">Loading seller information...</div>;
  }

  return (
    <div className="w-[90%] 800px:w-[50%] bg-white shadow rounded-[4px] p-4 mx-auto my-4">
      <h2 className="text-2xl font-bold text-center mb-6">Create Blog Post</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.title ? 'border-red-500' : 'border'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Content field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.content ? 'border-red-500' : 'border'
            }`}
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
        </div>

        {/* Category field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.category ? 'border-red-500' : 'border'
            }`}
          />
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        {/* Tags field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
          />
        </div>

        {/* Status field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Featured Image field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Featured Image *</label>
          <input
            type="file"
            name="featuredImage"
            onChange={handleFileChange}
            accept="image/*"
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.featuredImage && <p className="mt-1 text-sm text-red-600">{errors.featuredImage}</p>}
          {formData.featuredImage && (
            <div className="mt-2">
              <img 
                src={formData.featuredImage} 
                alt="Featured preview" 
                className="h-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>

        {/* Additional Images field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Additional Images</label>
          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <div className="flex flex-wrap mt-2">
            {formData.images.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`Preview ${index}`}
                className="h-24 w-24 object-cover rounded-md mr-2 mb-2"
              />
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Create Blog Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
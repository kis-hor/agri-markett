import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "../../static/data"; // Assuming you want to reuse this
import { toast } from "react-toastify";
import { createBlog } from "../../redux/actions/blog"; // Assuming this action exists

const CreateBlog = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.blogs); // Assuming blogs slice
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [featuredImage, setFeaturedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState(seller?.name || ""); // Pre-fill with seller name

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Blog created successfully!");
      navigate("/dashboard-blogs"); // Adjust route as needed
      window.location.reload();
    }
  }, [dispatch, error, success, navigate]);

  const handleFeaturedImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setFeaturedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImages((old) => [...old, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newForm = new FormData();
    if (featuredImage) {
      newForm.append("featuredImage", featuredImage);
    }
    images.forEach((image) => {
      newForm.append("images", image);
    });

    const data = {
      title,
      content,
      category,
      tags,
      author,
      featuredImage,
      images,
      shopId: seller._id, // Keeping this for consistency, adjust if not needed
    };

    dispatch(createBlog(data));
  };

  return (
    <div className="w-[90%] 800px:w-[50%] bg-white shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
      <h5 className="text-[30px] font-Poppins text-center">Create Blog</h5>
      {/* create blog form */}
      <form onSubmit={handleSubmit}>
        <br />
        <div>
          <label className="pb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={title}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your blog title..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            cols="30"
            required
            rows="8"
            name="content"
            value={content}
            className="mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your blog content..."
          ></textarea>
        </div>
        <br />
        <div>
          <label className="pb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full mt-2 border h-[35px] rounded-[5px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Choose a category">Choose a category</option>
            {categoriesData &&
              categoriesData.map((i) => (
                <option value={i.title} key={i.title}>
                  {i.title}
                </option>
              ))}
          </select>
        </div>
        <br />
        <div>
          <label className="pb-2">Tags</label>
          <input
            type="text"
            name="tags"
            value={tags}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter blog tags (comma-separated)..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="author"
            value={author}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Upload Featured Image <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            name="featuredImage"
            id="upload-featured"
            className="hidden"
            onChange={handleFeaturedImageChange}
          />
          <div className="w-full flex items-center flex-wrap">
            <label htmlFor="upload-featured">
              <AiOutlinePlusCircle size={30} className="mt-3" color="#555" />
            </label>
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Featured"
                className="h-[120px] w-[120px] object-cover m-2"
              />
            )}
          </div>
        </div>
        <br />
        <div>
          <label className="pb-2">Upload Additional Images</label>
          <input
            type="file"
            name="images"
            id="upload-images"
            className="hidden"
            multiple
            onChange={handleImagesChange}
          />
          <div className="w-full flex items-center flex-wrap">
            <label htmlFor="upload-images">
              <AiOutlinePlusCircle size={30} className="mt-3" color="#555" />
            </label>
            {images &&
              images.map((i) => (
                <img
                  src={i}
                  key={i}
                  alt=""
                  className="h-[120px] w-[120px] object-cover m-2"
                />
              ))}
          </div>
        </div>
        <br />
        <div>
          <input
            type="submit"
            value="Create"
            className="mt-2 cursor-pointer appearance-none text-center block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateBlog;
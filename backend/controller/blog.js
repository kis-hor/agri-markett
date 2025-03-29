const express = require("express");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Blog = require("../model/blog"); // Assuming the blog model file is named blog.js
const ErrorHandler = require("../utils/ErrorHandler");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const cloudinary = require("cloudinary");

// Create blog post
router.post(
  "/create-blog",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let featuredImage = {};
      let images = [];

      // Handle featured image upload
      if (req.body.featuredImage) {
        const featuredResult = await cloudinary.v2.uploader.upload(req.body.featuredImage, {
          folder: "blogs/featured",
        });
        featuredImage = {
          public_id: featuredResult.public_id,
          url: featuredResult.secure_url,
        };
      }

      // Handle additional images upload
      if (typeof req.body.images === "string") {
        images.push(req.body.images);
      } else if (req.body.images) {
        images = req.body.images;
      }

      const imagesLinks = [];
      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
          folder: "blogs",
        });
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }

      const blogData = req.body;
      blogData.featuredImage = featuredImage;
      blogData.images = imagesLinks;

      const blog = await Blog.create(blogData);

      res.status(201).json({
        success: true,
        blog,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Get all blog posts
router.get("/get-all-blogs", async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Get single blog post by ID
router.get(
  "/get-blog/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return next(new ErrorHandler("Blog post not found", 404));
      }

      // Increment views
      blog.views += 1;
      await blog.save();

      res.status(200).json({
        success: true,
        blog,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Update blog post
router.put(
  "/update-blog/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return next(new ErrorHandler("Blog post not found", 404));
      }

      const blogData = req.body;
      if (req.body.featuredImage) {
        // Delete old featured image if exists
        if (blog.featuredImage.public_id) {
          await cloudinary.v2.uploader.destroy(blog.featuredImage.public_id);
        }
        // Upload new featured image
        const result = await cloudinary.v2.uploader.upload(req.body.featuredImage, {
          folder: "blogs/featured",
        });
        blogData.featuredImage = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

      const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blogData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        blog: updatedBlog,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Delete blog post
router.delete(
  "/delete-blog/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return next(new ErrorHandler("Blog post not found", 404));
      }

      // Delete featured image
      if (blog.featuredImage.public_id) {
        await cloudinary.v2.uploader.destroy(blog.featuredImage.public_id);
      }

      // Delete additional images
      for (let i = 0; i < blog.images.length; i++) {
        await cloudinary.v2.uploader.destroy(blog.images[i].public_id);
      }

      await blog.remove();

      res.status(200).json({
        success: true,
        message: "Blog post deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Get all blogs - Admin only
router.get(
  "/admin-all-blogs",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const blogs = await Blog.find().sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        blogs,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
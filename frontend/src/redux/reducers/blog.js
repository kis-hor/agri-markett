import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  error: null,
  success: false,
  blog: null,
  blogs: [],       // For shop blogs
  allBlogs: [],    // For all blogs
  blogDetails: null
};

export const blogReducer = createReducer(initialState, {
  blogCreateRequest: (state) => {
    state.isLoading = true;
  },
  blogCreateSuccess: (state, action) => {
    state.isLoading = false;
    state.blog = action.payload;
    state.success = true;
  },
  blogCreateFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    state.success = false;
  },

  // get all blogs of shop
  getAllblogsShopRequest: (state) => {
    state.isLoading = true;
  },
  getAllblogsShopSuccess: (state, action) => {
    state.isLoading = false;
    state.blogs = action.payload;
  },
  getAllblogsShopFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // delete blog of a shop
  deleteblogRequest: (state) => {
    state.isLoading = true;
  },
  deleteblogSuccess: (state, action) => {
    state.isLoading = false;
    state.message = action.payload;
  },
  deleteblogFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get all blogs
  getAllblogsRequest: (state) => {
    state.isLoading = true;
  },
  getAllblogsSuccess: (state, action) => {
    state.isLoading = false;
    state.allBlogs = action.payload;
  },
  getAllblogsFailed: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  // get blog details
  blogDetailsRequest: (state) => {
    state.isLoading = true;
  },
  blogDetailsSuccess: (state, action) => {
    state.isLoading = false;
    state.blogDetails = action.payload;
  },
  blogDetailsFail: (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
  },

  clearErrors: (state) => {
    state.error = null;
  },
  clearMessages: (state) => {
    state.message = null;
    state.success = false;
  },
});
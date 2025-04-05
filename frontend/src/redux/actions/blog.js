import axios from "axios";
import { server } from "../../server";

// create blog
export const createBlog = (data) => async (dispatch) => {
  try {
    dispatch({
      type: "blogCreateRequest",
    });

    const config = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const { data: resData } = await axios.post(
      `${server}/blog/create-blog`, 
      data,
      config
    );
    
    dispatch({
      type: "blogCreateSuccess",
      payload: resData.blog,
    });
  } catch (error) {
    dispatch({
      type: "blogCreateFail",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// get all blogs of a shop
export const getAllBlogsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllblogsShopRequest",
    });

    const { data } = await axios.get(`${server}/blog/get-all-blogs/${id}`);
    dispatch({
      type: "getAllblogsShopSuccess",
      payload: data.blogs,
    });
  } catch (error) {
    dispatch({
      type: "getAllblogsShopFailed",
      payload: error.response.data.message,
    });
  }
};

// delete blog of a shop
export const deleteBlog = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteblogRequest",
    });

    const { data } = await axios.delete(
      `${server}/blog/delete-shop-blog/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteblogSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteblogFailed",
      payload: error.response.data.message,
    });
  }
};

// get all blogs
export const getAllBlogs = () => async (dispatch) => {
  try {
    dispatch({ type: "getAllBlogsRequest" });
    const { data } = await axios.get(`${server}/blog/get-all-blogs`);
    dispatch({
      type: "getAllBlogsSuccess",
      payload: data.blogs,
    });
  } catch (error) {
    dispatch({
      type: "getAllBlogsFailed",
      payload: error.response.data.message,
    });
  }
};

// get blog details
export const getBlogDetails = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "blogDetailsRequest",
    });

    const { data } = await axios.get(`${server}/blog/get-blog-details/${id}`);
    dispatch({
      type: "blogDetailsSuccess",
      payload: data.blog,
    });
  } catch (error) {
    dispatch({
      type: "blogDetailsFail",
      payload: error.response.data.message,
    });
  }
};
import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteBlog, getAllBlogs } from "../../redux/actions/blog";
import Loader from "../Layout/Loader";

const AllBlogs = () => {
  const { blogs, isLoading } = useSelector((state) => state.blogs); // Ensure state.blogs matches your reducer
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllBlogs()); // Fetch all blogs, no seller filter
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteBlog(id));
    window.location.reload(); // Consider dispatching getAllBlogs() again instead
  };

  const columns = [
    { field: "id", headerName: "Blog ID", minWidth: 150, flex: 0.7 },
    { field: "title", headerName: "Title", minWidth: 180, flex: 1.4 },
    { field: "author", headerName: "Author", minWidth: 130, flex: 0.6 },
    { field: "status", headerName: "Status", minWidth: 100, flex: 0.5 },
    { field: "views", headerName: "Views", type: "number", minWidth: 100, flex: 0.5 },
    { field: "createdAt", headerName: "Created At", type: "date", minWidth: 130, flex: 0.6 },
    {
      field: "Preview",
      flex: 0.8,
      minWidth: 100,
      headerName: "",
      sortable: false,
      renderCell: (params) => {
        const blog_title = params.row.title.replace(/\s+/g, "-");
        return (
          <Link to={`/blog/${blog_title}`}>
            <Button>
              <AiOutlineEye size={20} />
            </Button>
          </Link>
        );
      },
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "",
      sortable: false,
      renderCell: (params) => (
        <Button onClick={() => handleDelete(params.id)}>
          <AiOutlineDelete size={20} />
        </Button>
      ),
    },
  ];

  const rows = blogs && Array.isArray(blogs) 
  ? blogs.map((blog) => ({
      id: blog._id,
      title: blog.title || "No title",
      author: blog.author || "Unknown",
      status: blog.status || "Draft",
      views: blog.views || 0,
      createdAt: blog.createdAt ? new Date(blog.createdAt) : new Date(),
    }))
  : [];

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </>
  );
};

export default AllBlogs;
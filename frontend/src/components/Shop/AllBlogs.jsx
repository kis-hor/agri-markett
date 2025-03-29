import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteBlog, getAllBlogs } from "../../redux/actions/blog"; // Assuming these action creators exist
import Loader from "../Layout/Loader";

const AllBlogs = () => {
  const { blogs, isLoading } = useSelector((state) => state.blogs); // Assuming blogs slice in Redux
  const { seller } = useSelector((state) => state.seller); // Keeping seller for consistency

  const dispatch = useDispatch();

  useEffect(() => {
    // Assuming we fetch blogs for a specific author/seller, adjust as needed
    dispatch(getAllBlogs(seller._id));
  }, [dispatch, seller._id]);

  const handleDelete = (id) => {
    dispatch(deleteBlog(id));
    window.location.reload(); // Consider using a better state management approach
  };

  const columns = [
    { field: "id", headerName: "Blog ID", minWidth: 150, flex: 0.7 },
    {
      field: "title",
      headerName: "Title",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "author",
      headerName: "Author",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 100,
      flex: 0.5,
    },
    {
      field: "views",
      headerName: "Views",
      type: "number",
      minWidth: 100,
      flex: 0.5,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      type: "date",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: "Preview",
      flex: 0.8,
      minWidth: 100,
      headerName: "",
      sortable: false,
      renderCell: (params) => {
        const d = params.row.title;
        const blog_title = d.replace(/\s+/g, "-");
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
      renderCell: (params) => {
        return (
          <Button onClick={() => handleDelete(params.id)}>
            <AiOutlineDelete size={20} />
          </Button>
        );
      },
    },
  ];

  const rows = blogs.map((blog) => ({
    id: blog._id,
    title: blog.title,
    author: blog.author,
    status: blog.status,
    views: blog.views,
    createdAt: new Date(blog.createdAt), // Convert to Date object for sorting
  }));

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
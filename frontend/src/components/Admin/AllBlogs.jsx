import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { server } from "../../server";

const AllBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${server}/blog/admin-all-blogs`, { withCredentials: true })
      .then((res) => {
        console.log("API Response:", res.data);
        setBlogs(res.data.blogs || []); // Fallback to empty array
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error.response?.data || error.message);
        setIsLoading(false);
      });
  }, []);

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
      renderCell: (params) => (
        <Link to={`/blog/${params.id}`}>
          <Button>
            <AiOutlineEye size={20} />
          </Button>
        </Link>
      ),
    },
  ];

  const rows = blogs.map((blog) => ({
    id: blog._id,
    title: blog.title,
    author: blog.author,
    status: blog.status,
    views: blog.views,
    createdAt: new Date(blog.createdAt),
  }));

  console.log("Blogs state:", blogs);
  console.log("Rows for DataGrid:", rows);

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white">
      {isLoading ? (
        <div>Loading...</div> // Replace with your Loader component if desired
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
          autoHeight
        />
      )}
    </div>
  );
};

export default AllBlogs;
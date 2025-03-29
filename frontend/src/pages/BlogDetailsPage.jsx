// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useParams } from 'react-router-dom';
// import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
// import { getBlogBySlug } from "../redux/actions/blog";
// import Header from "../components/Layout/Header";
// import Footer from "../components/Layout/Footer";

// const BlogDetailsPage = () => {
//   const dispatch = useDispatch();
//   const { slug } = useParams();

//   const { blogDetails, loading, error } = useSelector((state) => state.blog);

//   useEffect(() => {
//     dispatch(getBlogBySlug(slug));
//   }, [dispatch, slug]);

//   return (
//     <>
//       <Header />
//       <main className="py-3">
//         <Container>
//           {loading ? (
//             <div className="text-center">
//               <Spinner animation="border" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </Spinner>
//             </div>
//           ) : error ? (
//             <Alert variant="danger">{error}</Alert>
//           ) : (
//             <Row>
//               <Col md={12}>
//                 <div className="blog-details">
//                   <img 
//                     src={blogDetails?.featuredImage?.url} 
//                     alt={blogDetails?.title}
//                     className="img-fluid mb-4"
//                   />
//                   <h1>{blogDetails?.title}</h1>
//                   <div className="blog-meta mb-4">
//                     <span className="me-3">
//                       <i className="fas fa-user me-1"></i>
//                       {blogDetails?.author?.name}
//                     </span>
//                     <span className="me-3">
//                       <i className="fas fa-calendar me-1"></i>
//                       {new Date(blogDetails?.createdAt).toLocaleDateString()}
//                     </span>
//                     <span>
//                       <i className="fas fa-eye me-1"></i>
//                       {blogDetails?.views} views
//                     </span>
//                   </div>
//                   <div 
//                     className="blog-content"
//                     dangerouslySetInnerHTML={{ __html: blogDetails?.content }}
//                   />
//                 </div>
//               </Col>
//             </Row>
//           )}
//         </Container>
//       </main>
//       <Footer />
//     </>
//   );
// };

// export default BlogDetailsPage;
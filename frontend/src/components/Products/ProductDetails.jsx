"use client"

import { useEffect, useState } from "react"
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { getAllProductsShop } from "../../redux/actions/product"
import { server } from "../../server"
import styles from "../../styles/styles"
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist"
import { addTocart } from "../../redux/actions/cart"
import { toast } from "react-toastify"
import axios from "axios"

const ProductDetails = ({ data }) => {
  const { wishlist } = useSelector((state) => state.wishlist)
  const { cart } = useSelector((state) => state.cart)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { products } = useSelector((state) => state.products)
  const [count, setCount] = useState(1)
  const [click, setClick] = useState(false)
  const [select, setSelect] = useState(0)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getAllProductsShop(data && data?.shop._id))
    if (wishlist && wishlist.find((i) => i._id === data?._id)) {
      setClick(true)
    } else {
      setClick(false)
    }
  }, [data, wishlist, dispatch])

  const incrementCount = () => {
    setCount(count + 1)
  }

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1)
    }
  }

  const removeFromWishlistHandler = (data) => {
    setClick(!click)
    dispatch(removeFromWishlist(data))
  }

  const addToWishlistHandler = (data) => {
    setClick(!click)
    dispatch(addToWishlist(data))
  }

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id)
    if (isItemExists) {
      toast.error("Item already in cart!")
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!")
      } else {
        const cartData = { ...data, qty: count }
        dispatch(addTocart(cartData))
        toast.success("Item added to cart successfully!")
      }
    }
  }

  const totalReviewsLength = products && products.reduce((acc, product) => acc + product.reviews.length, 0)

  const totalRatings =
    products &&
    products.reduce((acc, product) => acc + product.reviews.reduce((sum, review) => sum + review.rating, 0), 0)

  const avg = totalRatings / totalReviewsLength || 0

  const averageRating = avg.toFixed(2)

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      const groupTitle = data._id + user._id
      const userId = user._id
      const sellerId = data.shop._id
      await axios
        .post(`${server}/conversation/create-new-conversation`, {
          groupTitle,
          userId,
          sellerId,
        })
        .then((res) => {
          navigate(`/inbox?${res.data.conversation._id}`)
        })
        .catch((error) => {
          toast.error(error.response.data.message)
        })
    } else {
      toast.error("Please login to create a conversation")
    }
  }

  return (
    <div className="bg-white">
      {data ? (
        <div className={`${styles.section} w-[90%] 800px:w-[80%]`}>
          <div className="w-full py-5">
            <div className="block w-full 800px:flex">
              <div className="w-full 800px:w-[50%]">
                <img src={`${data && data.images[select]?.url}`} alt="" className="w-[80%]" />
                <div className="w-full flex">
                  {data &&
                    data.images.map((i, index) => (
                      <div className={`${select === index ? "border" : "null"} cursor-pointer`} key={index}>
                        <img
                          src={`${i?.url}`}
                          alt=""
                          className="h-[200px] overflow-hidden mr-3 mt-3"
                          onClick={() => setSelect(index)}
                        />
                      </div>
                    ))}
                </div>
              </div>
              <div className="w-full 800px:w-[50%] pt-5">
                <h1 className={`${styles.productTitle}`}>{data.name}</h1>
                <p>{data.description}</p>
                <div className="flex pt-3">
                  <h4 className={`${styles.productDiscountPrice}`}>Rs. {data.discountPrice}</h4>
                  <h3 className={`${styles.price}`}>{data.originalPrice ? data.originalPrice + "Rs." : null}</h3>
                </div>

                <div className="flex items-center mt-12 justify-between pr-3">
                  <div>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                      onClick={decrementCount}
                    >
                      -
                    </button>
                    <span className="bg-gray-200 text-gray-800 font-medium px-4 py-[11px]">{count}</span>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                      onClick={incrementCount}
                    >
                      +
                    </button>
                  </div>
                  <div>
                    {click ? (
                      <AiFillHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={() => removeFromWishlistHandler(data)}
                        color={click ? "red" : "#333"}
                        title="Remove from wishlist"
                      />
                    ) : (
                      <AiOutlineHeart
                        size={30}
                        className="cursor-pointer"
                        onClick={() => addToWishlistHandler(data)}
                        color={click ? "red" : "#333"}
                        title="Add to wishlist"
                      />
                    )}
                  </div>
                </div>
                <div
                  className={`${styles.button} !mt-6 !rounded !h-11 flex items-center`}
                  onClick={() => addToCartHandler(data._id)}
                >
                  <span className="text-white flex items-center">
                    Add to cart <AiOutlineShoppingCart className="ml-1" />
                  </span>
                </div>
                <div className="flex items-center pt-8">
                  <Link to={`/shop/preview/${data?.shop._id}`}>
                    <img src={`${data?.shop?.avatar?.url}`} alt="" className="w-[50px] h-[50px] rounded-full mr-2" />
                  </Link>
                  <div className="pr-8">
                    <Link to={`/shop/preview/${data?.shop._id}`}>
                      <h3 className={`${styles.shop_name} pb-1 pt-1`}>{data.shop.name}</h3>
                    </Link>
                    <h5 className="pb-3 text-[15px]">({data.ratings ? data.ratings.toFixed(1) : 0}/5) Ratings</h5>
                  </div>
                  <div className={`${styles.button} bg-[#6443d1] mt-4 !rounded !h-11`} onClick={handleMessageSubmit}>
                    <span className="text-white flex items-center">
                      Send Message <AiOutlineMessage className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ProductDetailsInfo
            data={data}
            products={products}
            totalReviewsLength={totalReviewsLength}
            averageRating={averageRating}
          />
          <br />
          <br />
        </div>
      ) : null}
    </div>
  )
}

const ProductDetailsInfo = ({ data, products, totalReviewsLength, averageRating }) => {
  const [active, setActive] = useState(1)

  return (
    <div className="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded">
      <div className="w-full flex justify-between border-b pt-10 pb-2">
        <div className="relative">
          <h5
            className={"text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"}
            onClick={() => setActive(1)}
          >
            Product Details
          </h5>
          {active === 1 ? <div className={`${styles.active_indicator}`} /> : null}
        </div>
        <div className="relative">
          <h5
            className={"text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"}
            onClick={() => setActive(2)}
          >
            Product Reviews
          </h5>
          {active === 2 ? <div className={`${styles.active_indicator}`} /> : null}
        </div>
        <div className="relative">
          <h5
            className={"text-[#000] text-[18px] px-1 leading-5 font-[600] cursor-pointer 800px:text-[20px]"}
            onClick={() => setActive(3)}
          >
            Seller Information
          </h5>
          {active === 3 ? <div className={`${styles.active_indicator}`} /> : null}
        </div>
      </div>
      {active === 1 ? (
        <>
          <p className="py-2 text-[18px] leading-8 pb-10 whitespace-pre-line">{data.description}</p>
        </>
      ) : null}

      {active === 2 ? (
        <div className="w-full min-h-[40vh] flex flex-col items-center py-3 overflow-y-scroll">
          {data && data.reviews && data.reviews.length > 0 ? (
            data.reviews.map((item, index) => (
              <div className="w-full flex my-4" key={index}>
                <img src={`${item.user.avatar?.url}`} alt="" className="w-[50px] h-[50px] rounded-full" />
                <div className="pl-2 w-full">
                  <div className="w-full flex items-center">
                    <h1 className="font-[600] mr-3">{item.user.name}</h1>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i}>
                          {item.rating >= i ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-star-fill text-yellow-500"
                              viewBox="0 0 16 16"
                            >
                              <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-star text-gray-300"
                              viewBox="0 0 16 16"
                            >
                              <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[#000000a4] ml-2">
                      {new Date(item.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="mt-2 text-[#000000a4]">{item.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <h5>No reviews for this product yet!</h5>
          )}
        </div>
      ) : null}

      {active === 3 && (
        <div className="w-full block 800px:flex p-5">
          <div className="w-full 800px:w-[50%]">
            <Link to={`/shop/preview/${data.shop._id}`}>
              <div className="flex items-center">
                <img src={`${data?.shop?.avatar?.url}`} className="w-[50px] h-[50px] rounded-full" alt="" />
                <div className="pl-3">
                  <h3 className={`${styles.shop_name}`}>{data.shop.name}</h3>
                  <h5 className="pb-2 text-[15px]">({averageRating}/5) Ratings</h5>
                </div>
              </div>
            </Link>
            <p className="pt-2">{data.shop.description}</p>
          </div>
          <div className="w-full 800px:w-[50%] mt-5 800px:mt-0 800px:flex flex-col items-end">
            <div className="text-left">
              <h5 className="font-[600]">
                Joined on: <span className="font-[500]">{data.shop?.createdAt?.slice(0, 10)}</span>
              </h5>
              <h5 className="font-[600] pt-3">
                Total Products: <span className="font-[500]">{products && products.length}</span>
              </h5>
              <h5 className="font-[600] pt-3">
                Total Reviews: <span className="font-[500]">{totalReviewsLength}</span>
              </h5>
              <Link to={`/shop/preview/${data.shop._id}`}>
                <div className={`${styles.button} !rounded-[4px] !h-[39.5px] mt-3`}>
                  <h4 className="text-white">Visit Shop</h4>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails

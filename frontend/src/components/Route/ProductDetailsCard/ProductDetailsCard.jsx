"use client"

import { useEffect, useState } from "react"
import { AiFillHeart, AiOutlineHeart, AiOutlineShoppingCart } from "react-icons/ai"
import { RxCross1 } from "react-icons/rx"
import { Link } from "react-router-dom"
import styles from "../../../styles/styles"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { addTocart } from "../../../redux/actions/cart"
import { addToWishlist, removeFromWishlist } from "../../../redux/actions/wishlist"

const ProductDetailsCard = ({ setOpen, data }) => {
  const { cart } = useSelector((state) => state.cart)
  const { wishlist } = useSelector((state) => state.wishlist)
  const dispatch = useDispatch()
  const [count, setCount] = useState(1)
  const [click, setClick] = useState(false)
  const [select, setSelect] = useState(false)

  const handleMessageSubmit = () => {}

  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1)
    }
  }

  const incrementCount = () => {
    setCount(count + 1)
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

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true)
    } else {
      setClick(false)
    }
  }, [wishlist, data._id])

  const removeFromWishlistHandler = (data) => {
    setClick(!click)
    dispatch(removeFromWishlist(data))
  }

  const addToWishlistHandler = (data) => {
    setClick(!click)
    dispatch(addToWishlist(data))
  }

  // Calculate average rating
  const calculateAverageRating = () => {
    if (!data.reviews || data.reviews.length === 0) return 0

    const totalRating = data.reviews.reduce((sum, review) => sum + review.rating, 0)
    return (totalRating / data.reviews.length).toFixed(1)
  }

  const averageRating = calculateAverageRating()
  const reviewCount = data.reviews ? data.reviews.length : 0

  return (
    <div className="bg-[#fff]">
      {data ? (
        <div className="fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
          <div className="w-[90%] 800px:w-[60%] h-[90vh] overflow-y-scroll 800px:h-[75vh] bg-white rounded-md shadow-sm relative p-4">
            <RxCross1 size={30} className="absolute right-3 top-3 z-50" onClick={() => setOpen(false)} />

            <div className="block w-full 800px:flex">
              <div className="w-full 800px:w-[50%]">
                <img src={`${data.images && data.images[0]?.url}`} alt="" className="w-[80%]" />
                <div className="flex">
                  <Link to={`/shop/preview/${data.shop._id}`} className="flex">
                    <img src={`${data.shop?.avatar?.url}`} alt="" className="w-[50px] h-[50px] rounded-full mr-2" />
                    <div>
                      <h3 className={`${styles.shop_name}`}>{data.shop.name}</h3>
                      <h5 className="pb-3 text-[15px]">
                        ({averageRating}/5) Ratings • {reviewCount} Reviews
                      </h5>
                    </div>
                  </Link>
                </div>
                <h5 className="text-[16px] text-[red] mt-5">{data.sold_out} Sold out</h5>
              </div>

              <div className="w-full 800px:w-[50%] pt-5 pl-[5px] pr-[5px]">
                <h1 className={`${styles.productTitle} text-[20px]`}>{data.name}</h1>
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
                  className={`${styles.button} mt-6 rounded-[4px] h-11 flex items-center`}
                  onClick={() => addToCartHandler(data._id)}
                >
                  <span className="text-[#fff] flex items-center">
                    Add to cart <AiOutlineShoppingCart className="ml-1" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ProductDetailsCard

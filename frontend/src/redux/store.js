import { configureStore } from "@reduxjs/toolkit"
import { userReducer } from "./reducers/user"
import { sellerReducer } from "./reducers/seller"
import { productReducer } from "./reducers/product"
import { eventReducer } from "./reducers/event"
import { cartReducer } from "./reducers/cart"
import { wishlistReducer } from "./reducers/wishlist"
import { orderReducer } from "./reducers/order"
import { notificationReducer } from "./reducers/notification" // Make sure this import is correct
import { blogReducer } from "./reducers/blog"

const Store = configureStore({
  reducer: {
    user: userReducer,
    seller: sellerReducer,
    products: productReducer,
    events: eventReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    notification: notificationReducer, // Add the notification reducer here
    blog: blogReducer,
  },
})

export default Store

"use client"

import { useEffect } from "react"
import "./App.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  FAQPage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  TrackOrderPage,
  UserInbox,
  ForgotPassword,
  ResetPassword,
  ShopForgotPassword,
  ShopResetPassword,
  PaymentVerificationPage,
  BlogPage,
  BlogDetailsPage,
} from "./routes/Routes.js"
import {
  ShopDashboardPage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopAllCoupouns,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrderDetails,
  ShopAllRefunds,
  ShopSettingsPage,
  ShopWithDrawMoneyPage,
  ShopInboxPage,
  ShopEditProduct,
} from "./routes/ShopRoutes"
import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardWithdraw,
} from "./routes/AdminRoutes"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Store from "./redux/store"
import { loadSeller, loadUser } from "./redux/actions/user"
import ProtectedRoute from "./routes/ProtectedRoute"
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute"
import { ShopHomePage } from "./ShopRoutes.js"
import SellerProtectedRoute from "./routes/SellerProtectedRoute"
import { getAllProducts } from "./redux/actions/product"
import NotificationsPage from "./pages/NotificationsPage.jsx"
import UserOrderDetails from "./components/UserOrderDetails"
import { getUnreadNotificationCount } from "./redux/actions/notification"
import NotificationToast from "./components/Shop/NotificationToast"
import UserNotificationToast from "./components/UserNotificationToast"
import AdminEditProduct from "./pages/AdminEditProduct"
import { NotificationProvider } from "./context/NotificationContext"


const App = () => {
  useEffect(() => {
    Store.dispatch(loadUser())
    Store.dispatch(loadSeller())
    Store.dispatch(getAllProducts())
    Store.dispatch(getUnreadNotificationCount())
  }, [])

  return (
    <BrowserRouter>
      
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignupPage />} />
            <Route path="/activation/:activation_token" element={<ActivationPage />} />
            <Route path="/seller/activation/:activation_token" element={<SellerActivationPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/best-selling" element={<BestSellingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/blogs" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/shop-forgot-password" element={<ShopForgotPassword />} />
            <Route path="/shop/reset-password/:token" element={<ShopResetPassword />} />
            <Route path="/order/success" element={<OrderSuccessPage />} />
            <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
            <Route path="/shop-create" element={<ShopCreatePage />} />
            <Route path="/shop-login" element={<ShopLoginPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/user/order/:id" element={<UserOrderDetails />} />
            <Route path="/order/:id" element={<UserOrderDetails />} />
            <Route path="/admin-edit-product/:id" element={<AdminEditProduct />} />
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin-dashboard-users" element={<AdminDashboardUsers />} />
            <Route path="/admin-dashboard-sellers" element={<AdminDashboardSellers />} />
            <Route path="/admin-dashboard-orders" element={<AdminDashboardOrders />} />
            <Route path="/admin-dashboard-products" element={<AdminDashboardProducts />} />
            <Route path="/admin-dashboard-withdraw" element={<AdminDashboardWithdraw />} />
            <Route path="/dashboard" element={<ShopDashboardPage />} />
            <Route path="/dashboard-create-product" element={<ShopCreateProduct />} />
            <Route path="/dashboard-products" element={<ShopAllProducts />} />
            <Route path="/dashboard-coupouns" element={<ShopAllCoupouns />} />
            <Route path="/dashboard-orders" element={<ShopAllOrders />} />
            <Route path="/dashboard-order/:id" element={<ShopOrderDetails />} />
            <Route path="/dashboard-refunds" element={<ShopAllRefunds />} />
            <Route path="/dashboard-settings" element={<ShopSettingsPage />} />
            <Route path="/dashboard-withdraw-money" element={<ShopWithDrawMoneyPage />} />
            <Route path="/dashboard-messages" element={<ShopInboxPage />} />
            <Route path="/dashboard-edit-product/:id" element={<ShopEditProduct />} />
            <Route path="/shop/:id" element={<ShopHomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/inbox" element={<UserInbox />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment-verification" element={<PaymentVerificationPage />} />
            <Route path="/track/order/:id" element={<TrackOrderPage />} />
          </Routes>
          <ToastContainer />
        </NotificationProvider>
      
    </BrowserRouter>
  )
}

export default App

import React, { useEffect, useState } from "react";
import styles from "../../styles/styles";
import { BsFillBagFill } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../Layout/Loader";

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    if (seller && seller._id) {
      dispatch(getAllOrdersOfShop(seller._id));
    }
  }, [dispatch, seller]);

  const data = orders && orders.find((item) => item._id === id);

  const orderUpdateHandler = async (e) => {
    await axios
      .put(
        `${server}/order/update-order-status/${id}`,
        {
          status,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Order updated!");
        navigate("/dashboard-orders");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const refundOrderUpdateHandler = async (e) => {
    await axios
    .put(
      `${server}/order/order-refund-success/${id}`,
      {
        status,
      },
      { withCredentials: true }
    )
    .then((res) => {
      toast.success("Order refund successful!");
      navigate("/dashboard-orders");
    })
    .catch((error) => {
      toast.error(error.response.data.message);
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <h1 className="text-2xl font-semibold">Order not found</h1>
      </div>
    );
  }

  const getProgressWidth = () => {
    switch (data?.status) {
      case "Processing":
        return "5%";
      case "Transferred to delivery partner":
        return "20%";
      case "Shipping":
        return "50%";
      case "Received":
        return "70%";
      case "On the way":
        return "90%";
      case "Delivered":
        return "100%";
      default:
        return "0%";
    }
  };

  const getBarColor = () => {
    switch (data?.status) {
      case "Processing":
        return "#f3a847";
      case "Transferred to delivery partner":
        return "#f3a847";
      case "Shipping":
        return "#f3a847";
      case "Received":
        return "#f3a847";
      case "On the way":
        return "#f3a847";
      case "Delivered":
        return "#00a854";
      default:
        return "#f3a847";
    }
  };

  return (
    <div className="w-full p-8">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-[25px] font-[600] text-[#000000ba] pb-2">
          Order Details
        </h1>
        <Link to="/dashboard-orders">
          <div className={`${styles.button} !bg-[#fce1e6] !rounded-[4px] text-[#e94560] font-[500] !h-[45px] px-[20px]`}>
            Order List
          </div>
        </Link>
      </div>

      <div className="w-full flex flex-col md:flex-row items-start gap-8 pt-8">
        {/* Order Info */}
        <div className="w-full md:w-2/3 bg-white rounded-[4px] shadow p-4 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="w-full flex justify-between">
              <span className="font-[600]">Order ID: #{data._id?.slice(0, 8)}</span>
              <span className="font-[600]">Placed on: {data.createdAt?.slice(0, 10)}</span>
            </div>
            <div className="w-full flex justify-between">
              <span className="font-[600]">Total Amount: ₹{data.totalPrice}</span>
              <span className={`font-[600] ${
                data.paymentInfo?.status === "Completed" || data.paymentStatus === "Paid"
                  ? "text-green-500"
                  : data.paymentInfo?.type === "COD"
                  ? "text-blue-500"
                  : "text-red-500"
              }`}>
                Payment: {
                  data.paymentInfo?.status === "Completed" || data.paymentStatus === "Paid"
                    ? "Paid"
                    : data.paymentInfo?.type === "COD"
                    ? "Cash On Delivery"
                    : "Pending"
                }
              </span>
            </div>
            <div className="w-full flex justify-between">
              <span className={`font-[600] ${data.status === "Delivered" ? "text-green-500" : "text-[#00000085]"}`}>
                Status: {data.status}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full mt-8">
            <h4 className="font-[600] mb-4">Order Progress</h4>
            <div className="w-full h-[20px] bg-[#f5f5f5] rounded-full">
              <div
                className="h-full rounded-full"
                style={{ width: getProgressWidth(), backgroundColor: getBarColor() }}
              ></div>
            </div>
          </div>

          {/* Order Items */}
          <div className="w-full mt-8">
            <h4 className="font-[600] mb-4">Order Items</h4>
            <div className="flex flex-col gap-4">
              {data.cart.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-4 border-b pb-4">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-[80px] h-[80px] object-cover rounded-[4px]"
                  />
                  <div className="flex-1">
                    <h5 className="font-[600]">{item.name}</h5>
                    <p className="text-[#00000085]">Quantity: {item.qty}</p>
                    <p className="text-[#00000085]">Price: ₹{item.discountPrice}</p>
                  </div>
                  <div className="font-[600]">
                    Total: ₹{item.discountPrice * item.qty}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Info & Actions */}
        <div className="w-full md:w-1/3 bg-white rounded-[4px] shadow p-4 md:p-8">
          <div className="flex flex-col gap-4">
            <h4 className="font-[600]">Customer Information</h4>
            <div>
              <p className="font-[600]">Name: {data.user?.name}</p>
              <p className="text-[#00000085]">Email: {data.user?.email}</p>
              <p className="text-[#00000085]">Phone: {data.shippingAddress?.phoneNumber}</p>
            </div>

            <h4 className="font-[600] mt-4">Shipping Address</h4>
            <div>
              <p className="text-[#00000085]">{data.shippingAddress?.address1}</p>
              <p className="text-[#00000085]">{data.shippingAddress?.city}, {data.shippingAddress?.country}</p>
              <p className="text-[#00000085]">ZIP: {data.shippingAddress?.zipCode}</p>
            </div>

            <h4 className="font-[600] mt-4">Update Order Status</h4>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-[40px] border border-[#00000028] rounded-[4px] px-2"
            >
              <option value="">Select Status</option>
              <option value="Processing">Processing</option>
              <option value="Transferred to delivery partner">Transferred to delivery partner</option>
              <option value="Shipping">Shipping</option>
              <option value="Received">Received</option>
              <option value="On the way">On the way</option>
              <option value="Delivered">Delivered</option>
              <option value="Processing refund">Processing refund</option>
              <option value="Refund Success">Refund Success</option>
            </select>

            <div className="flex flex-col gap-2 mt-4">
              <button
                className={`${styles.button} !bg-[#fce1e6] !rounded-[4px] text-[#e94560] font-[600] !h-[45px] !w-full`}
                onClick={orderUpdateHandler}
              >
                Update Status
              </button>
              {data.status !== "Processing refund" && data.status !== "Refund Success" && (
                <button
                  className={`${styles.button} !bg-red-100 !rounded-[4px] text-red-600 font-[600] !h-[45px] !w-full`}
                  onClick={refundOrderUpdateHandler}
                >
                  Process Refund
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

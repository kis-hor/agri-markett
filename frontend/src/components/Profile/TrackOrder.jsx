import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAllOrdersOfUser } from "../../redux/actions/order";
import { socket } from "../../socket";

const TrackOrder = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user._id]);

  useEffect(() => {
    if (orders) {
      const data = orders.find((item) => item._id === id);
      setOrder(data);
    }
  }, [orders, id]);

  useEffect(() => {
    if (socket) {
      socket.on("orderStatusUpdated", (data) => {
        if (data.orderId === id) {
          // Update the order status in the local state
          setOrder(prevOrder => ({
            ...prevOrder,
            status: data.status
          }));
          
          // Show notification
          toast.success(data.message);
          
          // Refresh the orders list
          dispatch(getAllOrdersOfUser(user._id));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("orderStatusUpdated");
      }
    };
  }, [socket, id, dispatch, user._id]);

  return (
    <div className="w-full h-[80vh] flex justify-center items-center">
      {order && (
        <div className="w-[90%] 800px:w-[50%] bg-white shadow rounded p-5">
          <h4 className="text-[20px] font-[600] text-center">
            Order Status
          </h4>
          <div className="mt-5">
            <div className="flex justify-between items-center">
              <h5 className="text-[18px] font-[500]">Order ID:</h5>
              <p className="text-[16px]">{order._id}</p>
            </div>
            <div className="flex justify-between items-center mt-3">
              <h5 className="text-[18px] font-[500]">Status:</h5>
              <p className="text-[16px]">{order.status}</p>
            </div>
            <div className="flex justify-between items-center mt-3">
              <h5 className="text-[18px] font-[500]">Last Updated:</h5>
              <p className="text-[16px]">{new Date(order.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;

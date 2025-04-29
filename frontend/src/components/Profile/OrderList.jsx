import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAllOrdersOfUser } from "../../redux/actions/order"
import { socket } from "../../socket"
import { toast } from "react-toastify"

const OrderList = () => {
  const { orders } = useSelector((state) => state.order)
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id))
  }, [dispatch, user._id])

  useEffect(() => {
    if (socket) {
      socket.on("orderStatusUpdated", (data) => {
        // Show notification
        toast.success(data.message)
        
        // Update the order in the Redux store
        dispatch({
          type: "updateOrderStatus",
          payload: {
            orderId: data.orderId,
            status: data.status
          }
        })
      })
    }

    return () => {
      if (socket) {
        socket.off("orderStatusUpdated")
      }
    }
  }, [socket, dispatch])

  return (
    <div className="w-full">
      <h3 className="text-[22px] font-[600] pb-2">Order History</h3>
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.map((order) => (
              <tr key={order._id} className="border-b">
                <td className="px-4 py-2">{order._id}</td>
                <td className="px-4 py-2">{order.status}</td>
                <td className="px-4 py-2">{order.cart.length}</td>
                <td className="px-4 py-2">${order.totalPrice}</td>
                <td className="px-4 py-2">
                  {new Date(order.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderList 
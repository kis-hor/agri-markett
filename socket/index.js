const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
const httpServer = createServer(app)

// Configure CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Socket server is running")
})

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

// Store connected users
const users = new Map()

// Socket connection handling
io.on("connection", (socket) => {
  console.log("New client connected")

  // Handle user connection
  socket.on("addUser", ({ userId, userType }) => {
    users.set(userId, { socketId: socket.id, userType })
    console.log(`User ${userId} connected as ${userType}`)
  })

  // Handle notifications
  socket.on("sendNotification", (data) => {
    const { recipientId, message, type } = data
    const recipient = users.get(recipientId)
    
    if (recipient) {
      io.to(recipient.socketId).emit("getNotification", {
        message,
        type,
        timestamp: new Date()
      })
    }
  })

  // Handle order notifications
  socket.on("newOrder", (data) => {
    const { sellerId, order } = data
    const seller = users.get(sellerId)
    
    if (seller) {
      io.to(seller.socketId).emit("newOrder", order)
    }
  })

  // Handle order status updates
  socket.on("orderStatusUpdate", (data) => {
    const { buyerId, order } = data
    const buyer = users.get(buyerId)
    
    if (buyer) {
      io.to(buyer.socketId).emit("orderStatusUpdated", order)
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    let disconnectedUserId
    for (const [userId, userData] of users.entries()) {
      if (userData.socketId === socket.id) {
        disconnectedUserId = userId
        break
      }
    }
    
    if (disconnectedUserId) {
      users.delete(disconnectedUserId)
      console.log(`User ${disconnectedUserId} disconnected`)
    }
  })
})

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`)
})
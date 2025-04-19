const socketIO = require("socket.io")
const http = require("http")
const express = require("express")
const cors = require("cors")
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Socket server is running")
})

let users = []

// Add a user to the socket connection
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) && users.push({ userId, socketId })
}

// Remove a user from the socket connection
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId)
}

// Get a user by userId
const getUser = (userId) => {
  return users.find((user) => user.userId === userId)
}

// Socket connection
io.on("connection", (socket) => {
  console.log("A user connected")

  // Take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id)
    io.emit("getUsers", users)
  })

  // Send and get messages
  socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
    const user = getUser(receiverId)
    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
        images,
      })
    }
  })

  // Send notification
  socket.on("sendNotification", (data) => {
    const user = getUser(data.userId)
    if (user) {
      io.to(user.socketId).emit("getNotification", data)
    }
  })

  // Disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected")
    removeUser(socket.id)
    io.emit("getUsers", users)
  })
})

server.listen(4000, () => {
  console.log("Socket server is running on port 4000")
})

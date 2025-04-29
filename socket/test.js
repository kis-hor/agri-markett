const io = require("socket.io-client")

// Create two test clients - one buyer and one seller
const buyerSocket = io("http://localhost:4000", {
  withCredentials: true,
  transports: ["websocket"]
})

const sellerSocket = io("http://localhost:4000", {
  withCredentials: true,
  transports: ["websocket"]
})

// Test data
const testData = {
  buyer: {
    userId: "buyer123",
    userType: "buyer"
  },
  seller: {
    userId: "seller123",
    userType: "seller"
  },
  order: {
    orderId: "order123",
    status: "pending",
    items: [
      { name: "Test Product", quantity: 2, price: 100 }
    ]
  }
}

// Connect buyer
buyerSocket.on("connect", () => {
  console.log("Buyer connected")
  buyerSocket.emit("addUser", testData.buyer)
})

// Connect seller
sellerSocket.on("connect", () => {
  console.log("Seller connected")
  sellerSocket.emit("addUser", testData.seller)
})

// Test notification
buyerSocket.on("getNotification", (data) => {
  console.log("Buyer received notification:", data)
})

sellerSocket.on("getNotification", (data) => {
  console.log("Seller received notification:", data)
})

// Test new order
sellerSocket.on("newOrder", (data) => {
  console.log("Seller received new order:", data)
})

// Test order status update
buyerSocket.on("orderStatusUpdated", (data) => {
  console.log("Buyer received order status update:", data)
})

// Run tests after both sockets are connected
let testsRun = false
const runTests = () => {
  if (testsRun) return
  testsRun = true

  console.log("\nRunning tests...\n")

  // Test 1: Send notification to buyer
  setTimeout(() => {
    console.log("Test 1: Sending notification to buyer")
    sellerSocket.emit("sendNotification", {
      recipientId: testData.buyer.userId,
      message: "Test notification from seller",
      type: "info"
    })
  }, 1000)

  // Test 2: Send new order to seller
  setTimeout(() => {
    console.log("Test 2: Sending new order to seller")
    buyerSocket.emit("newOrder", {
      sellerId: testData.seller.userId,
      order: testData.order
    })
  }, 2000)

  // Test 3: Update order status
  setTimeout(() => {
    console.log("Test 3: Updating order status")
    sellerSocket.emit("orderStatusUpdate", {
      buyerId: testData.buyer.userId,
      order: { ...testData.order, status: "processing" }
    })
  }, 3000)

  // Cleanup after tests
  setTimeout(() => {
    console.log("\nTests completed. Cleaning up...")
    buyerSocket.disconnect()
    sellerSocket.disconnect()
    process.exit(0)
  }, 4000)
}

// Run tests when both sockets are connected
let connectedSockets = 0
const socketConnected = () => {
  connectedSockets++
  if (connectedSockets === 2) {
    runTests()
  }
}

buyerSocket.on("connect", socketConnected)
sellerSocket.on("connect", socketConnected)

// Error handling
buyerSocket.on("connect_error", (error) => {
  console.error("Buyer connection error:", error)
})

sellerSocket.on("connect_error", (error) => {
  console.error("Seller connection error:", error)
}) 
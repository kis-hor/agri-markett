const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const crypto = require("crypto");
const Order = require("../model/order");

// eSewa Configuration
const ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; // UAT URL
const ESEWA_STATUS_CHECK_URL = "https://rc.esewa.com.np/api/epay/transaction/status/";
const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q"; // UAT Secret Key
const ESEWA_PRODUCT_CODE = "EPAYTEST"; // Test product code

/**
 * Generate HMAC SHA256 Signature for eSewa
 * @param {string} totalAmount - Formatted total amount (e.g. "100.00")
 * @param {string} transactionUuid - Unique transaction ID
 * @param {string} productCode - Product code from eSewa
 * @returns {string} base64 encoded signature
 */
const generateSignature = (totalAmount, transactionUuid, productCode) => {
  // Create the exact message string eSewa expects
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  
  // Create HMAC SHA256 hash
  const hash = crypto.createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");
    
  return hash;
};

/**
 * Process eSewa Payment
 */
router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    const { cart, shippingAddress, user, discountPrice } = req.body;

    try {
      // Calculate amounts
      const subTotalPrice = cart.reduce(
        (acc, item) => acc + item.qty * item.discountPrice, 
        0
      );
      const shipping = subTotalPrice * 0.1;
      const totalAmount = discountPrice
        ? (subTotalPrice + shipping - discountPrice).toFixed(2)
        : (subTotalPrice + shipping).toFixed(2);

      // Create order in database
      const order = await Order.create({
        cart,
        shippingAddress,
        user,
        totalPrice: totalAmount,
        subTotalPrice,
        shipping,
        discountPrice,
        paymentStatus: "Pending",
      });

      // Format transaction UUID (alphanumeric + hyphens only)
      const transactionUuid = `order-${order._id.toString().replace(/[^a-zA-Z0-9-]/g, "")}`;

      // Prepare payment data with properly formatted amounts
      const paymentData = {
        amount: Number(subTotalPrice).toFixed(2),
        tax_amount: "0.00",
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: ESEWA_PRODUCT_CODE,
        product_service_charge: "0.00",
        product_delivery_charge: Number(shipping).toFixed(2),
        success_url: `http://localhost:3000/payment/verify`,
        failure_url: `http://localhost:3000/payment/verify?status=failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: generateSignature(totalAmount, transactionUuid, ESEWA_PRODUCT_CODE),
      };

      // Debug log (remove in production)
      console.log("eSewa Payment Data:", {
        paymentData,
        signatureMessage: `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`,
        generatedSignature: paymentData.signature
      });

      res.status(200).json({
        success: true,
        paymentData,
        esewaUrl: ESEWA_URL,
      });

    } catch (error) {
      console.error("eSewa Processing Error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * Verify eSewa Payment Response
 */
router.get(
  "/verify",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { response } = req.query;

      if (!response) {
        return res.status(400).json({ 
          success: false, 
          message: "No payment response received" 
        });
      }

      // Decode Base64 response
      const decodedResponse = JSON.parse(Buffer.from(response, "base64").toString());
      const { 
        transaction_code, 
        status, 
        total_amount, 
        transaction_uuid, 
        product_code, 
        signature 
      } = decodedResponse;

      // Verify signature
      const expectedSignature = generateSignature(
        total_amount, 
        transaction_uuid, 
        product_code
      );

      if (signature !== expectedSignature) {
        console.error("Signature Mismatch:", {
          received: signature,
          expected: expectedSignature,
          message: `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`
        });
        return res.status(400).json({ 
          success: false, 
          message: "Invalid payment signature" 
        });
      }

      // Find and update order
      const orderId = transaction_uuid.replace("order-", "");
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }

      // Update order status
      if (status === "COMPLETE") {
        order.paymentInfo = {
          id: transaction_code,
          status: "Completed",
          type: "eSewa",
          signature,
        };
        order.paymentStatus = "Paid";
        await order.save();
        return res.redirect(`http://localhost:3000/order/success`);
      } else {
        order.paymentStatus = "Failed";
        await order.save();
        return res.redirect(`http://localhost:3000/order/failure`);
      }

    } catch (error) {
      console.error("Payment Verification Error:", error);
      return res.redirect(`http://localhost:3000/order-failure`);
    }
  })
);

/**
 * Check Payment Status (for pending transactions)
 */
router.get(
  "/status-check/:orderId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }

      const statusCheckUrl = `${ESEWA_STATUS_CHECK_URL}?product_code=${ESEWA_PRODUCT_CODE}&total_amount=${order.totalPrice}&transaction_uuid=order-${orderId}`;
      
      const response = await axios.get(statusCheckUrl);
      const { status, ref_id } = response.data;

      // Update order based on status
      if (status === "COMPLETE") {
        order.paymentStatus = "Paid";
        order.paymentInfo.refId = ref_id;
      } else if (["PENDING", "AMBIGUOUS"].includes(status)) {
        order.paymentStatus = "Pending";
      } else {
        order.paymentStatus = "Failed";
      }

      await order.save();

      res.status(200).json({
        success: true,
        status,
        refId: ref_id || null,
      });

    } catch (error) {
      console.error("Status Check Error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
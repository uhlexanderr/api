const Order = require("../models/Order");
const { 
  verifyToken, 
  verifyTokenAndAuthorization, 
  verifyTokenAndAdmin,
} = require("./verifyToken");
const express = require("express");

const router = express.Router();

// Create an order
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    if (err.name === "ValidationError") {
      // Handle validation errors
      res.status(400).json({ error: err.message });
    } else {
      // Handle other internal server errors
      console.error("Error while saving the order:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Update an order
router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) { 
    res.status(500).json(err);
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted!");
  } catch (err) {
    res.status(500).json(err);
  }
});

//get order by id
router.get('/find/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

module.exports = router;

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get monthly income
router.get("/income", async (req, res) => {
  try {
    const productId = req.query.productId; // Update the query parameter access
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    const income = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: previousMonth },
          ...(productId && { // Check if productId exists before adding it to the query
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);

    res.status(200).json(income);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Get total number of orders
router.get("/total", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.status(200).json({ total: totalOrders });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

// Get an order by ID
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching order" });
  }
});

// Cancel an order by orderId
router.put("/cancel/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order by orderId
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if the order is already canceled
    if (order.status === "Canceled") {
      return res.status(400).json({ error: "Order is already canceled" });
    }

    // Update the status to "Canceled"
    order.status = "Canceled";
    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error canceling order" });
  }
});

// Get total sales
router.get("/sales/total", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amount" },
        },
      },
    ]);

    if (totalSales.length > 0) {
      res.status(200).json(totalSales[0].totalSales);
    } else {
      res.status(200).json(0); // No sales data available
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
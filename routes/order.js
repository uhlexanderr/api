const Order = require("../models/Order");
const { 
  verifyToken, 
  verifyTokenAndAuthorization, 
  verifyTokenAndAdmin,
} = require("./verifyToken");
const express = require("express");

const router = express.Router();

// Create an order
router.post("/", verifyToken, async (req, res) => {
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
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
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
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted!");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get orders by user
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all orders
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get monthly income
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
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

module.exports = router;

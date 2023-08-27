const router = require("express").Router();
const { verifyTokenAndAdmin } = require("./verifyToken");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

router.get("/orders", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: "Pickup Successful" });
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const waitingForPickupOrders = await Order.countDocuments({ status: "Waiting for Pick-Up" });
    const invalidGcashRefOrders = await Order.countDocuments({ status: "Invalid Reference Number" });
    const canceledOrders = await Order.countDocuments({ status: "Canceled" });

    res.status(200).json({
      totalOrders,
      completedOrders,
      pendingOrders,
      waitingForPickupOrders,
      invalidGcashRefOrders,
      canceledOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/products", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const inStockProducts = await Product.countDocuments({ inStock: true });
    const outOfStockProducts = totalProducts - inStockProducts;

    res.status(200).json({
      totalProducts,
      inStockProducts,
      outOfStockProducts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ isAdmin: true });
    const regularUsers = totalUsers - adminUsers;

    res.status(200).json({
      totalUsers,
      adminUsers,
      regularUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

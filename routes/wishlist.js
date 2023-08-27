const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");

// Get wishlist by user ID
router.get("/:userId", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userID: req.params.userId });
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add product to wishlist
router.post("/:userId/add", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userID: req.params.userId },
      { $push: { products: { productId: req.body.productId } } },
      { new: true, upsert: true }
    );
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Remove product from wishlist
router.post("/:userId/remove", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userID: req.params.userId },
      { $pull: { products: { productId: req.body.productId } } },
      { new: true }
    );
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
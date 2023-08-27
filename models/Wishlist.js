const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true },
    products: [
      {
        productId: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);

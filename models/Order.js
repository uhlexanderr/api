const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        username: { type: String, required: true },
        products: [
            {
                productId: {
                    type: String,
                },
                title: { type: String },
                img: { type: String },
                size: { type: Array },
                color: { type: Array },
                price: { type: Number},
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        amount: { type: Number, required: true},
        reference_number: { type: String, required: true },
        status: { type: String, default: "Pending" },
    },
    {timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

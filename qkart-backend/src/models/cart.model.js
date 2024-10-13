const mongoose = require("mongoose");
const { productSchema } = require("./product.model");
const config = require("../config/config");

const cartSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    cartItems: [
      {
        productId: String,
        quantity: Number,
      },
    ],
    paymentOption: {
      type: String,
      default: "PAYMENT_OPTION_DEFAULT",
    },
  },
  {
    timestamps: false,
  }
);

/**
 * @typedef Cart
 */
const Cart = mongoose.model("Cart", cartSchema);

module.exports.Cart = Cart;

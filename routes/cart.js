var express = require("express");
var router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const Cart = require("../models/Cart.model");

// Get all items in the cart

router.get("/", isAuthenticated, async (req, res) => {
  const userId = req.user._id;
  try {
    const userCart = await Cart.findOne({ user: userId }).populate("cart.product");

    res.status(202).json(userCart);
  } catch (error) {
    console.error("Error adding product to cart", error);
    res.status(500).json({ errorMsg: "Server error" });
  }
});

// Add item to the cart
router.post("/add", isAuthenticated, async (req, res, next) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;
  try {
    let userCart = await Cart.findOne({ user: userId });

    if (!productId) {
      return res.status(404).json({ errorMsg: "Product does not exist" });
    }

    const existingProduct = userCart.cart.find((item) => item.product.toString() === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      userCart.cart.push({ product: productId, quantity });
    }

    userCart = await userCart.populate("cart.product");

    userCart = await userCart.save();
    res.status(201).json(userCart);
  } catch (error) {
    console.error("Could not add item to cart", error);
    res.status(500).json({ errorMsg: "Server Error", error });
  }
});

// Remove an item form the cart by it's ID

router.delete("/remove/:productId", isAuthenticated, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;
  try {
    const userCart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { cart: { product: productId } } },
      { new: true }
    ).populate("cart.product");

    res.status(202).json(userCart);
  } catch (error) {
    console.error("Error removing product from cart", error);
    res.status(500).json({ errorMsg: "Server error" });
  }
});

// Increment quantity of a product in the cart
router.patch("/increment/:productId", isAuthenticated, async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;
  try {
    let userCart = await Cart.findOneAndUpdate(
      { user: userId, "cart.product": productId },
      { $inc: { "cart.$.quantity": 1 } },
      { new: true }
    );
    res.status(202).json(userCart);
  } catch (error) {
    console.error("Error incrementing product quantity", error);
    res.status(500).json({ errorMsg: "Server Error" });
  }
});

// Decrement quantity of a product in the cart
router.patch("/decrement/:productId", isAuthenticated, async (req, res, next) => {
    const userId = req.user._id;
    const { productId } = req.params;
    try {
      let userCart = await Cart.findOneAndUpdate(
        { user: userId, "cart.product": productId },
        { $inc: { "cart.$.quantity": -1 } },
        { new: true }
      );
      res.status(202).json(userCart);
    } catch (error) {
      console.error("Error incrementing product quantity", error);
      res.status(500).json({ errorMsg: "Server Error" });
    }
});

module.exports = router;

var express = require("express");
var router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const Cart = require("../models/Cart.model");

// Get all items in the cart

router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const userCart = await Cart.findOne({ user: userId });

    const populatedCard = await userCart.populate("cart.product");

    res.json(userCart.cart);
  } catch (error) {
    console.error("Error retrieving cart", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add items to cart

router.post("/add", isAuthenticated, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    let userCart = await Cart.findOne({ user: userId });

    if (!productId) {
      return res.status(404).json({ errorMsg: "Product not found" });
    }

    const existingProduct = userCart.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      userCart.cart.push({ product: productId, quantity });
    }

    userCart = await userCart.save();

    res.json(userCart);
  } catch (error) {
    console.error("Could not add item to cart", error);
    res.status(500).json({ errorMsg: "Server Error", error });
  }
});

// Remove a specific item from the cart

router.delete("/remove/:productId", isAuthenticated, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    console.log("productId", productId);
    let userCart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { cart: { product: productId } } },
      { new: true }
    );

    res.json(userCart);
  } catch (error) {
    console.error("Error removing product from cart", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Increment quantity of a product in the cart
// Decrement quantity of a product in the cart

module.exports = router;
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const User = require("../models/User.model");

router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    const foundUsers = await User.find();
    res.status(200).json(foundUsers);
  } catch (error) {
    console.error("Error finding users", error);
    res.status(500).json({ errorMsg: "Error finding users", error });
  }
});

router.get("/profile/:userId", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params
  try {
    const foundUser = await User.findById(userId)
    res.status(200).json(foundUser)
  } catch (error) {
    console.error(`Error finding user ${userId}`, error);
    res.status(500).json({ errorMsg: "Error finding user", error });
  }
})

router.patch("/cart", isAuthenticated, async (req, res, next) => {
  console.log(req.user);
  const { cart } = req.body;
  try {
    const foundUserCart = await User.findByIdAndUpdate(
      req.user._id,
      { cart: cart },
      { new: true, runValidators: true }
    );
    res.status(200).json(foundUserCart);
  } catch (error) {
    console.error("There was an error adding to cart", error);
    res
      .status(500)
      .json({ errorMsg: "There was an error adding to cart", error });
  }
});


module.exports = router;

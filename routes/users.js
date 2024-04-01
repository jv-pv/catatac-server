const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const User = require("../models/User.model");
const isAdmin = require("../middleware/isAdmin");

router.get("/", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const foundUsers = await User.find().populate("reviews");
    res.status(200).json(foundUsers);
  } catch (error) {
    console.error("Error finding users", error);
    res.status(500).json({ errorMsg: "Error finding users", error });
  }
});

router.get("/profile/:userId", isAuthenticated, async (req, res, next) => {
  const { userId } = req.params;
  try {
    const foundUser = await User.findById(userId).populate({
      path: "reviews",
      populate: {
        path: "product",
        select: "name"
      }
    });
    res.status(200).json(foundUser);
  } catch (error) {
    console.error(`Error finding user ${userId}`, error);
    res.status(500).json({ errorMsg: "Error finding user", error });
  }
});

router.put("/profile/edit/:userId", isAuthenticated, async (req, res, next) => {
    const { userId } = req.params;
    try {
      const foundUserToUpdate = await User.findByIdAndUpdate(userId, req.body, { new: true });
      res.status(200).json(foundUserToUpdate)
    } catch (error) {
      console.error("Error updating user profile", error)
      res.status(500).json({ errorMsg: "Error updating profile", error})
    }
  }
);

router.delete("/profile/delete/:userId", isAuthenticated, async (req, res, next) => {
    const { userId } = req.params;
    try {
      const foundUserToDelete = await User.findByIdAndDelete(userId);
      res.status(200).json(foundUserToDelete);
    } catch (error) {
      console.error(`Error deleting user ${userId}`, error);
      res
        .status(500)
        .json({ errorMsg: "Error deleting your user account", error });
    }
  }
);

// router.patch("/cart", isAuthenticated, async (req, res, next) => {
//   console.log(req.user);
//   const { cart } = req.body;
//   try {
//     const foundUserCart = await User.findByIdAndUpdate(req.user._id, { cart: cart }, { new: true, runValidators: true }).populate({
//       path: "cart",
//       populate: {
//         path: "product",
//         select: "name price"
//       }
//     })
//     res.status(200).json(foundUserCart);
//   } catch (error) {
//     console.error("There was an error adding to cart", error);
//     res
//       .status(500)
//       .json({ errorMsg: "There was an error adding to cart", error });
//   }
// });



module.exports = router;
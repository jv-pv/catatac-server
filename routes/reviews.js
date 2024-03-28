const express = require("express");
const router = express.Router();

const Product = require("../models/Product.model");
const Review = require("../models/Review.model");
const isAuthenticated = require("../middleware/isAuthenticated");
const User = require("../models/User.model");

router.post("/:productId", isAuthenticated, async (req, res, next) => {
  const { title, review } = req.body;
  const { productId } = req.params;
  const userId = req.user._id;
  try {
    const newReview = await Review.create({
      title,
      review,
      product: productId,
      user: userId,
    });

    const productToPopulate = await Product.findByIdAndUpdate(
      newReview.product,
      {
        $push: { reviews: newReview._id },
      },
      {
        new: true,
      }
    );

    const userToPopulate = await User.findByIdAndUpdate(
      newReview.user,
      {
        $push: { reviews: newReview._id },
      },
      {
        new: true,
      }
    );

    const populatedProduct = await productToPopulate.populate("reviews");
    const populatedUserReview = await userToPopulate.populate("reviews");

    console.log("Populated product with new task ==>", populatedProduct);
    console.log("Populated user review ==>", populatedUserReview);
    res.json({populatedProduct, populatedUserReview});
  } catch (error) {
    console.error("Error creating review", error);
    res.status(500).json({ errorMsg: "Error creating review", error });
  }
});

module.exports = router;

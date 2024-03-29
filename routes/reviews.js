const express = require("express");
const router = express.Router();

const Product = require("../models/Product.model");
const Review = require("../models/Review.model");
const isAuthenticated = require("../middleware/isAuthenticated");
const User = require("../models/User.model");

// Post a review to a product by the product id

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

// Delete Review by it's id

router.delete("/user/:reviewId", isAuthenticated, async (req, res, next) => {
  const { reviewId } = req.params
  const userId = req.user._id

  try {
    
    // find the specific review to delete
    const review = await Review.findById(reviewId)

    if (!review) {
      res.status(404).json({ errorMsg: "Review not found" })
    }

    if (review.user.toString() !== userId.toString()) {
      res.status(403).json({ errorMsg: "You are not authorized to delete this review" })
    }

    // delete fetched review by it's ID
    await Review.findByIdAndDelete(reviewId)

    // Remove review from product review array
    await Product.findByIdAndUpdate(
      review.product,
      { $pull: { reviews: reviewId } },
      { new: true }
    )

    // Remove review form user review array  
    await User.findByIdAndUpdate(
      userId,
      { $pull: { reviews: reviewId } },
      { new: true }
    )

    res.status(200).json({ message: "Review successfully deleted" })

  } catch (error) {
    console.error("Error deleting review", error)
    res.status(500).json({ errorMsg: "Error deleting review", error })
  }

})

module.exports = router;
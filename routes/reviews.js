const express = require("express");
const router = express.Router();

const Product = require("../models/Product.model");
const Review = require("../models/Review.model");

router.post("/:productId", async (req, res, next) => {
  const { title, review } = req.body;
  const { productId } = req.params
  try {
    const newReview = await Review.create({
      title,
      review,
      product: productId,
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

    const populatedProduct = await productToPopulate.populate("reviews");

    console.log("Populated product with new task ==>", populatedProduct);
    res.json(populatedProduct);
  } catch (error) {
    console.error("Error creating review", error);
    res.status(500).json({ errorMsg: "Error creating review", error });
  }
});

module.exports = router;

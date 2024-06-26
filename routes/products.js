const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const Product = require("../models/Product.model");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");
const Review = require("../models/Review.model");
const User = require("../models/User.model");

router.get("/", async (req, res, next) => {
  try {
    const foundProducts = await Product.find().populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "name",
      }
    });
    res.status(201).json(foundProducts);
  } catch (error) {
    console.error("Error finding products", error);
    res.status(500).json({ errorMsg: "Error finding products", error });
  }
});

router.get("/details/:productId", async (req, res, next) => {
  const { productId } = req.params;
  try {
    const foundProduct = await Product.findById(productId).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "name",
      }
    });
    res.status(201).json(foundProduct);
  } catch (error) {
    console.error(`Error finding product ${productId}`, error);
    res
      .status(500)
      .json({ errorMsg: `Error finding product ${productId}`, error });
  }
});

// protect this route
router.post("/", isAuthenticated, isAdmin ,async (req, res, next) => {
  const { imageUrl, name, description, price, stock } = req.body;
  try {
    const createdProduct = await Product.create({
      imageUrl,
      name,
      description,
      price,
      stock,
    });
    res.status(201).json({createdProduct, successMsg: "Successfully added product"});
  } catch (error) {
    console.error("There was an error creating product", error);
    res.status(500).json({ errorMsg: "Could not create product", error });
  }
});


// protect this route
router.put("/update/:productId", isAuthenticated, isAdmin, async (req, res, next) => {
  const { productId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ errorMsg: "Specified Id is not valid" });
    return;
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true }).populate("reviews");
    res.status(201).json({updatedProduct, successMsg: "Successfully edited product"});
  } catch (error) {
    console.error("There was an updating the product", error);
    res.status(500).json({ errorMsg: "Could not update product", error });
  }
});


// protect this route // Consider the orphaned reviews in the DB when a product is deleted.
router.delete("/delete/:productId", isAuthenticated, isAdmin, async (req, res, next) => {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ errorMsg: "Specified Id is not valid" });
      return;
    }
    try {
      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (deletedProduct) {
        await Review.deleteMany({ product: productId });

        await User.updateMany(
          { reviews: { $in: deletedProduct.reviews } },
          { $pull: { reviews: { $in: deletedProduct.reviews } } }
        );
      }

      res.status(201).json({ message: "Product and associated reviews successfully deleted" });
    } catch (error) {
      console.error(`Failed to delete product ${productId}`, error);
      res.json({ errorMsg: `Failed to delete product ${productId}`, error });
    }
  }
);

module.exports = router;
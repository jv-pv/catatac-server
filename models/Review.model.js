const { model, Schema } = require("mongoose");

const reviewSchema = new Schema(
  {
    title: String,
    review: String,
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Review", reviewSchema);
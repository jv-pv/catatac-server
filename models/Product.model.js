const { model, Schema } = require("mongoose");

const productSchema = new Schema({
    imageUrl: String,
    name: String,
    description: String,
    price: String,
    stock: Number,
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
}
);

module.exports = model("Product", productSchema);
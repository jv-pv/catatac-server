const { Schema, model } = require("mongoose")

const cartModel = new Schema({
    cart: [{
        product: {type: Schema.Types.ObjectId, ref: "Product"},
        quantity: {type: Number, default: 1}
    }],
    user: {type: Schema.Types.ObjectId, ref: "User"}
})

module.exports = model("Cart", cartModel)
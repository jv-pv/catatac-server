const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    reviews: [{type: Schema.Types.ObjectId, ref: "Review"}],
    cart: [{product:{type: Schema.Types.ObjectId, ref: "Product"}, quantity: {type: Number, default: 1}}],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
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
      street: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      state: { type: String, default: "", trim: true },
      country: {type: String, default: "", trim: true},
      zipCode: { type: String, default: "", trim: true },
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    cart: {type: Schema.Types.ObjectId, ref: "Cart"},
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);

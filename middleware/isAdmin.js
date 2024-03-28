const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token || token === "null") {
    return res.status(401).json({ message: "Token not found" });
  }

  try {
    const tokenInfo = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(tokenInfo._id);
    console.log(tokenInfo, user);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ errorMsg: "Admin access required" });
    }

    req.user = tokenInfo;
    next();
  } catch (error) {
    console.log(error.message, "There was an error");
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = isAdmin;

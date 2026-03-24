const express = require("express");
const {
  registerUser,
  loginUser,
  resetPassword,
} = require("./authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);

module.exports = router;




const bcrypt = require("bcryptjs");
const User = require("./User");
const generateToken = require("./jwt");

async function registerUser(req, res) {
  try {
    const { username, email, password, tags = [] } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedPassword = String(password || "").trim();

    if (!username || !normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists. Please log in instead.",
        code: "USER_EXISTS",
      });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    const role =
      normalizedEmail === process.env.ADMIN_EMAIL ? "admin" : "student";

    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      tags,
      role,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        tags: user.tags,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedPassword = String(password || "").trim();

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        tags: user.tags,
        bio: user.bio,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const normalizedPassword = String(newPassword || "").trim();

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "No account found for this email." });
    }

    user.password = await bcrypt.hash(normalizedPassword, 10);
    await user.save();

    res.json({
      message: "Password updated successfully. Please log in with your new password.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { registerUser, loginUser, resetPassword };




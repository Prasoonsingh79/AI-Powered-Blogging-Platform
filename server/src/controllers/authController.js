import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔐 Token Generator
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRES_IN || "1d" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRES_IN || "7d" }
  );

  return { accessToken, refreshToken };
};

// ✅ REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("📥 Register attempt:", { name, email });

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // 🧠 Generate unique username
    let baseUsername = email.split("@")[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // ⚙️ Create user
    const user = new User({
      name,
      email: normalizedEmail,
      username,
      password, // mongoose pre-save hook will hash this
    });

    await user.save();
    console.log("✅ User registered successfully:", username);

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ user: userResponse, ...tokens });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({
      message: "Server error during registration",
      error: err.message,
    });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📥 Login attempt:", email);

    if (!email || !password)
      return res.status(400).json({ message: "Please provide both email and password" });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      console.log("❌ No user found for:", normalizedEmail);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match:", isMatch);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ user: userResponse, ...tokens });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};

// ✅ REFRESH TOKEN
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "Missing refresh token" });

    const user = await User.findOne({ refreshToken });
    if (!user)
      return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Token expired or invalid" });

      const tokens = generateTokens(user);
      user.refreshToken = tokens.refreshToken;
      await user.save();

      res.json(tokens);
    });
  } catch (err) {
    console.error("❌ Refresh token error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("❌ Logout error:", err);
    res.status(500).json({ message: err.message });
  }
};

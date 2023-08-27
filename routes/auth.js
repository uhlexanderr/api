const router = require("express").Router();
const User = require("../models/User");
const Cart = require("../models/Cart");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  const { username, email, password, firstName, lastName, mobile_number, isAdmin } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { mobile_number }] });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username already exists. Please choose a different username." });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already exists. Please choose a different email." });
      }
      if (existingUser.mobile_number === mobile_number) {
        return res.status(409).json({ message: "Mobile number already exists. Please choose a different mobile number." });
      }
    }

    const newUser = new User({
      username,
      email,
      password: CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString(),
      firstName,
      lastName,
      mobile_number,
      isAdmin, // Include isAdmin in the new user
    });

    const savedUser = await newUser.save();

    // Create a cart for the new user
    const newCart = new Cart({
      userID: savedUser._id,
      products: [],
    });

    const savedCart = await newCart.save();

    // Associate the cart with the user
    savedUser.cart = savedCart._id;
    await savedUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username }).populate("cart");

    if (!user) {
      return res.status(401).json({ message: "Wrong Credentials!" });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json({ message: "Wrong Credentials!" });
    }

    const { password, ...others } = user._doc;

    return res.status(200).json({ ...others, accessToken }); // Send the response without the password, including the mobile_number
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// update password
router.put('/change-password/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    // Check if the current password provided by the user matches the stored password
    const isPasswordMatch = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    ).toString(CryptoJS.enc.Utf8);

    if (req.body.currentPassword !== isPasswordMatch) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    // Encrypt the new password and update it in the database
    const encryptedPassword = CryptoJS.AES.encrypt(
      req.body.newPassword,
      process.env.PASS_SEC
    ).toString();

    user.password = encryptedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

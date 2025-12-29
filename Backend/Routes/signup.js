const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email is Already Used By Another Account" });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const new_user = await User.create({
      name,
      email,
      password: hash
    });

    let token = jwt.sign({ email: new_user.email }, process.env.JWT_SECRET || "privatestring");
    res.cookie("token", token);
    return res.status(200).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

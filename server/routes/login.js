const express = require('express');
const bcrypt = require('bcrypt');
const createToken = require('../utils/tokencreation');
const User = require('../models/user_schema');
const router = express.Router();

const expiryTime = 2 * 24 * 60 * 60;

router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email)
        console.log(password)

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Email" });
        }

        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            const token = createToken(user._id);

            res.cookie('jwt', token, { httpOnly: true, maxAge: expiryTime * 1000 });

            const { password, ...userData } = user.toObject();

            console.log("Login successful");
            return res.json({ user: userData, message: "Login Successful" });
        } else {
            console.log("Invalid password");
            return res.status(400).json({ message: "Invalid Password" });
        }
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;

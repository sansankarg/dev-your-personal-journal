const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const createToken=require('../utils/tokencreation')
const User = require('../models/user_schema');

const expiryTime = 2 * 24 * 60 * 60;

router.post('/', async (req, res) => {
    try {
        const { firstName, lastName,  email, password } = req.body;
        console.log(firstName)
        console.log(lastName)
        console.log(email)
        console.log(password)
        let existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Account Already Exists" });
        }

        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
        });

        await newUser.save();

        const token = createToken(newUser._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: expiryTime * 1000 });
        console.log("User created and cookie saved");
        return res.status(201).json({ message: "Registration Successful" });
    } catch (err) {
        console.error("Error during Registration:", err);
        return res.status(500).json({ message: "An error occurred during Registration" });
    }
});

module.exports = router;

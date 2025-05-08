const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const createToken=require('../utils/tokencreation')
const User = require('../models/user_schema');
const MarkDown = require('../models/markDown')
const {requireAuth}=require('../middleware/authMiddleware')

const expiryTime = 2 * 24 * 60 * 60;

// signup
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName,  email, haven, password } = req.body;
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
            haven: haven,
            password: password,
        });

        await newUser.save();

        if (!newUser._id) {
            console.error('Failed to create user with _id:', newUser);
            return res.status(500).json({ message: "An error occurred while saving the user." });
        }

        const welcomeMarkdown = new MarkDown({
            fileName: "Welcome.md",
            content: `# Welcome ${firstName}!\n\nThis is your first markdown file.\nEnjoy your journey!`,
            userId: newUser._id,  // Link the markdown file to the new user's ID
            bookmark: false,
            synapses: [],
        });

        await welcomeMarkdown.save();

        const token = createToken(newUser._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: expiryTime * 1000 });
        console.log("User created and cookie saved");
        return res.status(201).json({ message: "Registration Successful" });
    } catch (err) {
        console.error("Error during Registration:", err);
        return res.status(500).json({ message: "An error occurred during Registration" });
    }
});

//login
router.post("/login", async (req, res) => {
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

//logout
router.get('/logout',(req,res)=>{
    console.log("Logout endpoint hit");
    res.cookie('jwt', '', { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1 });
    return res.json({message:"Logout Successful"})
})

//checkauth
router.get('/checkauth',requireAuth,(req,res)=>{
    return res.json({isAuthenticated:true, user:req.user})
})

module.exports = router;

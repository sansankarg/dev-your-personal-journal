const express = require('express');
const router = express.Router();
const MarkDown = require('../models/markDown');
const User = require('../models/user_schema')

router.delete('/', async (req, res) => {
    const { userId, templateIndex } = req.body; // Receive templateIndex instead of templateId

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ensure that the index is valid
        if (templateIndex < 0 || templateIndex >= user.templates.length) {
            return res.status(400).json({ error: 'Invalid template index' });
        }

        // Remove the template from the array at the given index
        user.templates.splice(templateIndex, 1);

        await user.save();

        res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;

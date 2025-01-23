const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')
const User = require('../models/user_schema')
router.post('/', async (req, res) => {
    const { templateName, templateLogo, fileName, content, synapses, userId } = req.body;
    console.log(templateName);
    console.log(templateLogo);
    if (!fileName) {
        return res.status(400).json({ error: 'File name is required' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newTemplate = {
            templateName,
            templateLogo,
            fileName,
            content: content || '',
            synapses: synapses || [],
            createdAt: new Date(),
        };

        user.templates.push(newTemplate);

        await user.save();

        res.status(200).json({ message: 'Template added successfully', template: newTemplate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports=router
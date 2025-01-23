const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')
router.post('/', async (req, res) => {
    const fileName = req.body.newFile.fileName;
    const content = req.body.newFile.content;
    const userId = req.body.id;
    console.log("User id : ",userId)
    console.log("Save request reached server");
  
    if (!fileName) {
      return res.status(400).json({ message: 'File name is required.' });
    }
  
    try {
      const newFile = new MarkDown({ userId, fileName, content: content || '' });
      await newFile.save();
      console.log("Save request approved with new id : ",newFile._id)
      res.status(201).json({ message: 'File created successfully', data: newFile });
    } catch (error) {
      console.error('Error creating markdown file:', error);
      res.status(500).json({ message: 'Error creating file' });
    }
  });
module.exports=router
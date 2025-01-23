const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')
router.get('/', async (req, res) => {
    try {
      const bookmarkedFiles = await MarkDown.find({ bookmarked: true });
      console.log("bookmarked succesfully");
      res.status(200).json(bookmarkedFiles);
    } catch (error) {
      console.error('Error fetching bookmarked markdown files:', error);
      res.status(500).json({ message: 'Error fetching bookmarked files' });
    }
  });
module.exports=router
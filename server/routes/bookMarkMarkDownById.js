const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')
router.put('/', async (req, res) => {
    const id = res.locals.id;
    const bookmark = res.locals.bookmark;
    const userId = req.body.userId;
  
    console.log("Bookmark update request received for ID:", id, "User ID:", userId, "Bookmark:", bookmark);

  try {
    const file = await MarkDown.findOne({ _id: id, userId: userId });

      if (!file) {
        return res.status(404).json({ message: 'File not found or access denied' });
      }

      file.bookmark = bookmark;
      const updatedFile = await file.save();

      console.log(`Bookmark ${bookmark ? 'added' : 'removed'} successfully for ID:`, id);

      res.status(200).json({
        message: `File ${bookmark ? 'bookmarked' : 'unbookmarked'} successfully`,
        data: updatedFile,
      });
    } catch (error) {
      console.error('Error updating bookmark for markdown file:', error);
      res.status(500).json({ message: 'Error updating bookmark' });
  }
  });
module.exports=router
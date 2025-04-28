const express = require('express');
const router = express.Router();
const MarkDown = require('../models/markDown');

// Route to bookmark a markdown file
router.put('/:fileId', async (req, res) => {
  const { fileId } = req.params; // Corrected to access fileId from req.params
  const { userId, bookmark } = req.body;  // Get userId and bookmark from request body
  
  console.log("Bookmark update request received for ID:", fileId, "User ID:", userId, "Bookmark:", bookmark);

  try {
    // Find the file by fileId and userId
    const file = await MarkDown.findOne({ _id: fileId, userId: userId });

    if (!file) {
      return res.status(404).json({ message: 'File not found or access denied' });
    }

    // Update the bookmark field of the found file
    file.bookmark = bookmark;
    const updatedFile = await file.save();

    console.log(`Bookmark ${bookmark ? 'added' : 'removed'} successfully for ID:`, fileId);

    res.status(200).json({
      message: `File ${bookmark ? 'bookmarked' : 'unbookmarked'} successfully`,
      data: updatedFile,
    });
  } catch (error) {
    console.error('Error updating bookmark for markdown file:', error);
    res.status(500).json({ message: 'Error updating bookmark' });
  }
});

module.exports = router;

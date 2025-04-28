const express = require('express');
const router = express.Router();
const MarkDown = require('../models/markDown');

router.delete('/', async (req, res) => {
  const {userId, markDownId} = req.body;
  // const { id } = req.params;
  // const userId = req.query.userId;
  console.log("Delete request received for ID:", markDownId, "and User ID:", userId);

  try {
    const file = await MarkDown.findOne({ _id: markDownId, userId: userId });

    if (!file) {
      return res.status(404).json({ message: 'File not found or access denied' });
    }

    await MarkDown.findByIdAndDelete(markDownId);
    console.log("File deleted successfully for ID:", markDownId);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting markdown file:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

module.exports = router;

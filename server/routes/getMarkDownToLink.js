const express = require('express');
const router = express.Router();
const MarkDown = require('../models/markDown');

router.post('/', async (req, res) => {
  const userId = req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  console.log("Fetching files for userId:", userId);

  try {
    const files = await MarkDown.find({ userId: userId }).select('fileName _id bookmark');
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching markdown files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

module.exports = router;

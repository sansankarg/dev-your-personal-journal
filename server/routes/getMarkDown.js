const express = require('express');
const router = express.Router();
const MarkDown = require('../models/markDown');

router.post('/', async (req, res) => {
  const { userId } = req.body;
  console.log('Received userId:', userId);

  try {
    const files = await MarkDown.find({ userId: userId });
    console.log("Markdown files were sent.");
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching markdown files:', error);
    res.status(500).json({ message: 'Error fetching files' });
  }
});

module.exports = router;

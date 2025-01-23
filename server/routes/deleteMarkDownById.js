const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')
router.post('/', async (req, res) => {
    const id = res.locals.id;
    const userId = req.body.userId;
    console.log("Delete request received for ID:", id, "and User ID:", userId);

      try {
        const file = await MarkDown.findOne({ _id: id, userId: userId });

        if (!file) {
          return res.status(404).json({ message: 'File not found or access denied' });
        }

        await MarkDown.findByIdAndDelete(id);
        console.log("File deleted successfully for ID:", id);

        res.status(200).json({ message: 'File deleted successfully' });
      } catch (error) {
        console.error('Error deleting markdown file:', error);
        res.status(500).json({ message: 'Error deleting file' });
      }
  });
module.exports=router
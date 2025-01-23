const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')
router.put('/', async(req, res)=>{
    const id = res.locals.id;
    const fileName = res.locals.fileName;
    const content = res.locals.content;
    const synapses = res.locals.synapses;
    const userId = res.locals.userId;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
    
      try {
        const updatedFile = await MarkDown.findOneAndUpdate(
          { _id: id, userId: userId },
          { fileName, content, synapses },
          { new: true }
        );
    
        if (!updatedFile) {
          return res.status(404).json({ message: 'File not found or unauthorized access' });
        }
    
        console.log("Update request for ", id, " was approved");
        res.status(200).json({ message: 'File saved successfully', data: updatedFile });
      } catch (error) {
        console.error('Error updating markdown file', error);
        res.status(500).json({ message: 'Error updating file' });
      }
})
module.exports=router
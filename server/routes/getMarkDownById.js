const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')
router.post('/', async(req, res)=>{
  const id = res.locals.id;
  const userId = req.body.id;
  console.log("User id : ",userId)
  try {
    const file = await MarkDown.findById(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    console.log("Get request for ",id," was approved");
    res.status(200).json(file);
  } catch (error) {
    console.error('Error fetching markdown file by ID:', error);
    res.status(500).json({ message: 'Error fetching file' });
  }
})
module.exports=router
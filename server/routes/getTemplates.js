const express=require('express')
const router=express.Router()
const MarkDown = require('../models/markDown')
const User = require('../models/user_schema')
router.get('/', async (req, res) => {
    const { userId } = req.query;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ templates: user.templates });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
module.exports=router
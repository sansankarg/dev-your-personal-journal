const express=require('express');
const router=express.Router()
const {requireAuth}=require('../middleware/authMiddleware')

router.get('/',requireAuth,(req,res)=>{
    return res.json({isAuthenticated:true, user:req.user})
})
module.exports=router
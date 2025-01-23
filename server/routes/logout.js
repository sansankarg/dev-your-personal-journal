const express=require('express')
const router=express.Router()

router.get('/',(req,res)=>{
    console.log("Logout endpoint hit");
    res.cookie('jwt', '', { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1 });
    return res.json({message:"Logout Successful"})
})
module.exports=router
const jwt=require('jsonwebtoken')
const User=require('../models/user_schema')
const requireAuth=(req,res,next)=>{
    const token=req.cookies.jwt;
    if(token)
    {
        jwt.verify(token,'ifyouarebadiamyourdadthenwhoisyourmothermywifey',async (err,decodedToken)=>{
            if(err)
            {
                console.log(err);
                return res.json({isAuthenticated:false,message:"Invalid Login"})
            }
            else
            {
               try{
                    const user= await User.findById(decodedToken.id).select('-password');
                    if(!user){
                        return res.json({isAuthenticated:false,message:"user not found"})
                    }
                    req.user=user
                    next()
               }
               catch(err){
                console.log(err);
                return res.json({ isAuthenticated: false, message: "Something went wrong" });
               }
            }
        })
    }
    else
    {
        return res.json({isAuthenticated:false,message:"Invalid Login"})
    }
}
module.exports={requireAuth}
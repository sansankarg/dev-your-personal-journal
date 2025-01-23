const express=require('express')
const router=express.Router()
const userproduct=require('../models/users_products')
router.get('/',async (req,res)=>{
    console.log(req.query)
    const {userId}=req.query
    try{
        const userProduct=await userproduct.findOne({userId})
       
        if (userProduct && userProduct.cart.length > 0) {
            res.status(200).send({ cart: userProduct.cart });
        } else {
            res.status(200).send({ cart: [], message: "Cart is empty" });
        }
    }  catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).send({ message: "Error fetching cart", error });
    }
})
module.exports=router
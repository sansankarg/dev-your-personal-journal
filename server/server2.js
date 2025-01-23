const express=require('express')
const app=express();
const cookieParser=require('cookie-parser')
const mongoose=require('mongoose')
require('dotenv').config()
// const MONGO_URI = 'mongodb://localhost:27017/veggies-emart';

const MONGO_URI = 'mongodb+srv://veggiesemart:Scwqyyw1DZfnFg3C@veggies-emart.ogeea.mongodb.net/veggies-emart?retryWrites=true&w=majority&appName=veggies-emart';
mongoose.connect(MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true})
    .then(()=>console.log('Connected to MongoDB'))
    .catch((err)=>console.error('Error connecting to MongoDB:',err));


const cors=require('cors')
app.use(cors({
    origin: true, 
    credentials: true, 
  }));
app.use(express.json())
app.use(cookieParser())


const testingRoute=require('./routes/testing')
const registrationRoute=require('./routes/registration')
const loginRoute=require('./routes/login')
const logoutRoute=require('./routes/logout')
const checkauth=require('./routes/checkauth')
const subcategoriesRoute=require('./routes/subcategory')
const categoriesRoute=require('./routes/category')
const miscRoute=require('./routes/misc')
const homecontentRoute=require('./routes/homecontent')
const updateUserRoute=require('./routes/updateUser')
const addtoCartRoute=require('./routes/addtocart')
const addOrderRoute=require('./routes/addOrder')
const fetchOrderRoute=require('./routes/fetchorders')
const fetchCartRoute=require('./routes/fetchcart')
const fetchAddressRoute=require('./routes/fetchAddress')
const deleteAddressRoute=require('./routes/deleteAddress')
const updateAddressRoute=require('./routes/updateAddress')
const fetchWishListStatusRoute=require('./routes/fetchwishliststatus')
const fetchWishListRoute=require('./routes/fetchwishlist')
const DeleteCartRoute=require('./routes/deletecart')
const cancelOrderRoute=require('./routes/cancelorder')
const addtoWishListRoute = require('./routes/changewishliststatus')
const sellerRegister=require('./routes/sellerRegistration')
const sellerAddProduct=require('./routes/addProduct')
const fetchSellerProduct=require('./routes/fetchSellerProduct')
const deleteProduct=require('./routes/deleteProduct')
const editProduct=require('./routes/editProduct')
app.use('/testing',testingRoute)
app.use('/registration',registrationRoute)
app.use('/login',loginRoute)
app.use('/updateUser',updateUserRoute)
app.use('/sellerRegistration',sellerRegister)
app.use('/addProduct',sellerAddProduct)
app.use('/fetchsellerproducts',fetchSellerProduct)
app.use('/logout',logoutRoute)
app.use('/checkauth',checkauth)
app.use('/fetchAddress',fetchAddressRoute)
app.use('/updateAddress',updateAddressRoute)
app.use('/deleteAddress',deleteAddressRoute)
app.use('/categories',categoriesRoute)
app.use('/misc',miscRoute)
app.use('/home-content',homecontentRoute)
app.use('/:category/:subcategory/:productname', (req, res, next) => {
    console.log('Incoming request to subcategories route');
    console.log('Category:', req.params.category);
    console.log('Subcategory:', req.params.subcategory);
    console.log('Product name:', req.params.productname);
    res.locals.category = req.params.category;
    res.locals.subcategory = req.params.subcategory;
    res.locals.productname = req.params.productname;
    //console.log('pricerange'+req.query.pricerange)
    next(); // Pass control to the next handler
});
app.use('/:category/:subcategory/:productname',subcategoriesRoute)
app.use('/addtocart',addtoCartRoute)
app.use('/addorder',addOrderRoute)
app.use('/user/cart',fetchCartRoute)
app.use('/user/cart/remove',DeleteCartRoute)
app.use('/cancelorder',cancelOrderRoute)
app.use('/addtowishlist',addtoWishListRoute)
app.use('/user/wishliststatus',fetchWishListStatusRoute)
app.use('/user/wishlist',fetchWishListRoute)
app.use('/product/delete',deleteProduct)
app.use('/product/edit',editProduct)
app.use('/orders/:status', (req, res, next) => {
    res.locals.status = req.params.status;
    next();
})
app.use('/orders/:status',fetchOrderRoute)
app.listen(5000,()=>{
    console.log("Server running on port 5000");
})
app.listen(5000, '0.0.0.0', () => {
    console.log("Server running on http://0.0.0.0:5000");
  });
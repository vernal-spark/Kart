const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");


const getCartByUser = async (user) => {
  const cart=await Cart.findOne({email:user.email})
  if(cart===null){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart")
  }
  return cart
};


const addProductToCart = async (user, productId, quantity) => {
  let cart=await Cart.findOne({email:user.email})
  if(!cart){
    try{
       cart=await Cart.create({
        email:user.email,
        cartItems:[],
        paymentOption:config.default_payment_option
    })

  }catch(e){
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"User cart creation failed because user already have a cart");
    }
  }
  if (cart == null)
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed");
  
  // const result=
  // console.log(result)
  if(cart.cartItems.some((ele)=>ele.product._id==productId)){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart")
  }
  const product=await Product.findOne({_id:productId})
  if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database")
  }
  cart.cartItems.push({product:product,quantity:quantity})
  await cart.save()
  return cart
};

const updateProductInCart = async (user, productId, quantity) => {
  // console.log("1")
  const cart=await Cart.findOne({email:user.email})
  if(cart==null){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product")
  }
  const product=await Product.findOne({_id:productId})
  if(product==null){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database")
  }
  const result=cart.cartItems.some((ele)=>ele.product._id==productId)
  if(!result){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
  }
  // console.log("1")
  cart.cartItems.forEach((ele)=>{
    if(ele.product._id==productId){
      ele.quantity=quantity
    }
  })
  await cart.save()
  return cart
};


const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({ email: user.email });
  if (cart == null) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }

  // Find the index of the cart item matching the input productId
  let productIndex = -1;
  for (let i = 0; i < cart.cartItems.length; i++) {
    if (productId == cart.cartItems[i].product._id) {
      productIndex = i;
    }
  }

  // If product not in cart, throw error. Otherwise, delete from cart.
  if (productIndex == -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart. ");
  } else {
    cart.cartItems.splice(productIndex, 1);
  }

  await cart.save();
};



const checkout = async (user) => {
  const cart=await Cart.findOne({email:user.email});
  if(cart==null){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart")
  }
  if(cart.cartItems.length==0){
    throw new ApiError(httpStatus.BAD_REQUEST,"Cart is Empty")
  }
  let hasSetNonDefaultAddress = await user.hasSetNonDefaultAddress();
  if (!hasSetNonDefaultAddress) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Address not set");
  }
 
  let total = 0;
  for (let i = 0; i < cart.cartItems.length; i++) {
    total += cart.cartItems[i].product.cost * cart.cartItems[i].quantity;
  }

  if (total > user.walletMoney) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User has insufficient money to process"
    );
  }

  user.walletMoney -= total;
  await user.save();

  cart.cartItems = [];
  await cart.save();
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};

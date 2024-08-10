const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");


const getUserById=async(id)=>{
    return User.findById(id)
}

const getUserByEmail=async(email)=>{
    return User.findOne({email})
}

const createUser=async(user)=>{
    if(await User.isEmailTaken(user.email)){
        throw new ApiError(httpStatus.OK,"Email Already Taken")
    }
    // const hashedPassword=await bcrypt.hash(user.password,10)
    const result=await User.create(user)
    return result
}



const getUserAddressById = async (id) => {
    return await User.findOne({_id:id},{email:1,address:1})
};


const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();

  return user.address;
};

module.exports={getUserById,
    getUserByEmail,
    createUser,
    setAddress,
    getUserAddressById
}

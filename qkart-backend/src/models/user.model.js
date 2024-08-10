const mongoose = require("mongoose");
const validator = require("validator");
const config = require("../config/config");
const bcrypt=require('bcryptjs')

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type:String,
      required:true,
      trim:true,
      unique:true,
      lowercase:true,
      validate(value){
        if(!validator.isEmail(value)){
          throw new Error("Invalid Email")
        }
      }
    },
    password: {
      type: String,
      required:true,
      trim:true,
      minlength:8,

      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type:Number,
      required:true,
      default:config.default_wallet_money
    },
    address: {
      type: String,
      default: config.default_address,
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

userSchema.pre('save',async function(next){
  const user=this;
  if(user.isModified("password")){
    user.password=await bcrypt.hash(user.password,10)
  }
  next();
})

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement the isEmailTaken() static method
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const result=await this.findOne({email})
  return !!result
};

/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user=this;
  return bcrypt.compare(password,user.password)
};

/**
 * Check if user have set an address other than the default address
 * - should return true if user has set an address other than default address
 * - should return false if user's address is the default address
 *
 * @returns {Promise<boolean>}
 */
 userSchema.methods.hasSetNonDefaultAddress = async function () {
  const user = this;
  // CRIO_UNCOMMENT_START_MODULE_TEST
  // return user.address === config.default_address;
  // CRIO_UNCOMMENT_END_MODULE_TEST
  // CRIO_SOLUTION_START_MODULE_TEST
  return user.address !== config.default_address;
  // CRIO_SOLUTION_END_MODULE_TEST
};


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS
/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */
 const User=mongoose.model("users",userSchema)
 module.exports.User=User
 module.exports={User}

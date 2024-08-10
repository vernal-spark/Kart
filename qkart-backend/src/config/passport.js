const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("./config");
const { tokenTypes } = require("./tokens");
const { User } = require("../models");


const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken()
};


const jwtVerify = async (payload, done) => {
  try{
  if(payload.type!=tokenTypes.ACCESS){
    throw new Error("Invalid token type")
  }
  
  const user = await User.findById(payload._id)
 
  if(!user){
    return done(null,false)
  }
  return done(null,user)
}catch(e){
  return done(e,false)
}
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};

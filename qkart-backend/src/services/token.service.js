const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { tokenTypes } = require("../config/tokens");


const generateToken = (_id, expires, type, secret = config.jwt.secret) => {
  const payload={
    _id,
    iat:Math.floor(Date.now() / 1000),
    exp:expires,
    type}
  const token=jwt.sign(payload,secret)
  return token
};

const generateAuthTokens = async (user) => {
  const {_id}=user
  const expires=Math.floor(Date.now()/1000)+config.jwt.accessExpirationMinutes*60
  const type=tokenTypes.ACCESS
  const accessToken=generateToken(_id,expires,type)
  return{ access:{
    "token":accessToken,
    "expires":new Date(expires*1000)
  }}
};

module.exports = {
  generateToken,
  generateAuthTokens,
};

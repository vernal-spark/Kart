const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const getUserById = async (id) => {
  return await User.findOne({ _id: id });
};

const getUserByUserName = async (username) => {
  return User.findOne({ username });
};

const createUser = async (user) => {
  if (await User.isUserNameTaken(user.username)) {
    throw new ApiError(httpStatus.OK, "User Name Already Taken");
  }
  const result = await User.create(user);
  return result;
};

const getUserAddressById = async (id) => {
  return await User.findOne({ _id: id }, { username: 1, address: 1 });
};

const setAddress = async (user, newAddress) => {
  user.address.push({ address: newAddress });
  await user.save();

  return user.address;
};

const deleteAddress = async (user, addressId) => {
  const filteredAddress = user.address.filter(
    (add) => !ObjectId(add._id).equals(ObjectId(addressId))
  );
  user.address = filteredAddress;
  await user.save();
  return filteredAddress;
};

module.exports = {
  getUserById,
  getUserByUserName,
  createUser,
  setAddress,
  getUserAddressById,
  deleteAddress,
};

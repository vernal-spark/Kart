const httpStatus = require("http-status");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");

const loginUserWithUserNameAndPassword = async (username, password) => {
  const user = await userService.getUserByUserName(username);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Incorrect User Name or Password"
    );
  }
  return user;
};

module.exports = {
  loginUserWithUserNameAndPassword,
};

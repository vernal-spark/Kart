const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, userService, tokenService } = require("../services");

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json({ user });
});

const login = catchAsync(async (req, res) => {
  const user = await authService.loginUserWithUserNameAndPassword(
    req.body.username,
    req.body.password
  );
  const token = await tokenService.generateAuthTokens(user);
  res
    .status(httpStatus.OK)
    .json({ username: user.username, balance: user.walletMoney, token });
});

module.exports = {
  register,
  login,
};

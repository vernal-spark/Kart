const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService, tokenService } = require("../services");

const getUser = catchAsync(async (req, res) => {
  let result;
  const { userId } = req.params;
  if (req.query.q == "address") {
    result = await userService.getUserAddressById(userId);
  } else {
    result = await userService.getUserById(userId);
  }
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (req.user.username !== result.username) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  } else {
    if (req.query.q == "address")
      res.status(httpStatus.OK).json({ address: result.address });
    else res.status(httpStatus.OK).json(result);
  }
});

const setAddress = catchAsync(async (req, res) => {
  const { _id } = await tokenService.decodeToken(
    req.headers.authorization.split(" ")[1]
  );

  const user = await userService.getUserById(_id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.username !== req.user.username) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  }

  const address = await userService.setAddress(user, req.body.address);

  res.send({
    address: address,
  });
});

const getAddresses = catchAsync(async (req, res) => {
  const { _id } = await tokenService.decodeToken(
    req.headers.authorization.split(" ")[1]
  );

  const user = await userService.getUserById(_id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(user.address);
});

const deleteAddress = catchAsync(async (req, res) => {
  const { addressId } = req.params;

  const { _id } = await tokenService.decodeToken(
    req.headers.authorization.split(" ")[1]
  );

  const user = await userService.getUserById(_id);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await userService.deleteAddress(user, addressId);

  res.send({ address: result });
});

module.exports = {
  getUser,
  setAddress,
  getAddresses,
  deleteAddress,
};

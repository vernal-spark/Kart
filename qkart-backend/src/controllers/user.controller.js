const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

const getUser = catchAsync(async (req, res) => {
  let result
    const {userId}=req.params
    if(req.query.q=="address"){
      result=await userService.getUserAddressById(userId)
    }
    else{
      result=await userService.getUserById(userId);
    }
    if(!result){
      throw new ApiError(httpStatus.NOT_FOUND,"User not found")
    }
    if(req.user.email!==result.email){
      throw new ApiError(httpStatus.FORBIDDEN,"User not authorized to access this resource")
    }
    else{
      if(req.query.q=="address")
      res.status(httpStatus.OK).json({address:result.address})
      else
      res.status(httpStatus.OK).json(result)
    }
});


const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email != req.user.email) {
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

module.exports = {
  getUser,
  setAddress,
};

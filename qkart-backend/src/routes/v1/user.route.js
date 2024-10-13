const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const router = express.Router();
const auth = require("../../middlewares/auth");

router.get("/address", userController.getAddresses);

router.post(
  "/address",
  auth,
  validate(userValidation.setAddress),
  userController.setAddress
);

router.delete(
  "/address/:addressId",
  auth,
  validate(userValidation.deleteAddress),
  userController.deleteAddress
);

router.get(
  "/:userId",
  auth,
  validate(userValidation.getUser),
  userController.getUser
);

module.exports = router;

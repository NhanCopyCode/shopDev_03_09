"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller.js");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler.js");
const { authentication, authenticationV2 } = require("../../auth/authUtils.js");

//authentication
router.use(authenticationV2);

router.post("", asyncHandler(productController.createProduct));


module.exports = router;

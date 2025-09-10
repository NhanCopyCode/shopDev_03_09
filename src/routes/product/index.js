"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller.js");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler.js");
const { authentication } = require("../../auth/authUtils.js");

//authentication
router.use(authentication);

router.post("", asyncHandler(productController.createProduct));


module.exports = router;

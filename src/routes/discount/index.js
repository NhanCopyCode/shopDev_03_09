"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller.js");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler.js");
const { authentication, authenticationV2 } = require("../../auth/authUtils.js");
const discountController = require("../../controllers/discount.controller.js");

router.post("/amount", asyncHandler(discountController.getDiscountAmount));
router.get("/list_product_codes", asyncHandler(discountController.getAllDiscountCodesWithProducts));


//authentication
router.use(authenticationV2);

router.post("", asyncHandler(discountController.createDiscount));
router.get("", asyncHandler(discountController.getAllDiscountCodes));
router.patch("/:id", asyncHandler(discountController.updateDiscount));

module.exports = router;

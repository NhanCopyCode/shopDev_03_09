"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller.js");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler.js");
const { authentication, authenticationV2 } = require("../../auth/authUtils.js");
const discountController = require("../../controllers/discount.controller.js");



//authentication
router.use(authenticationV2);

router.post("", asyncHandler(discountController.createDiscount));
router.patch("/:id", asyncHandler(discountController.updateDiscount));
router.post(
	"/publish/:id",
	asyncHandler(productController.publishProductByShop)
);
router.post(
	"/unpublish/:id",
	asyncHandler(productController.unpublishProductByShop)
);

// Query
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
	"/publish/all",
	asyncHandler(productController.getAllPublishedForShop)
);

module.exports = router;

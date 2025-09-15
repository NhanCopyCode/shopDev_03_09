"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller.js");
const router = express.Router();
const asyncHandler = require("../../helpers/asyncHandler.js");
const { authentication, authenticationV2 } = require("../../auth/authUtils.js");

router.get(
	"/search/:keySearch",
	asyncHandler(productController.getListSearchProduct)
);

router.get("", asyncHandler(productController.findAllProducts));
router.get("/:product_id", asyncHandler(productController.findProduct));

//authentication
router.use(authenticationV2);

router.post("", asyncHandler(productController.createProduct));
router.patch("/:productId", asyncHandler(productController.updateProduct));
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

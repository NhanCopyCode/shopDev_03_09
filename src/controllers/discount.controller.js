"use strict";

// const ProductService = require("../services/product.service");
const ProductServiceLv2 = require("../services/product.service.xxx.js");
const { OK, CREATED, SuccessResponse } = require("../core/success.response.js");
const DiscountService = require("../services/discount.service.js");
const { discountSchema } = require("../validators/discount.validator.js");
const { BadRequestError } = require("../core/error.response.js");
const { getJoiErrorMessage } = require("../utils/index.js");
class DiscountController {
	createDiscount = async (req, res, next) => {
		const { value, error } = discountSchema.validate(req.body, {
			abortEarly: false,
			stripUnknown: true, // remove unexpected fields
		});
		
		if(error) {
			throw new BadRequestError(getJoiErrorMessage(error));
		}
		return new SuccessResponse({
			message: "Create discount successfully!",
			metadata: await DiscountService.createDiscountCode({
				payload: {
					...req.body,
					shopId: req.user.userId,
				},
			}),
		}).send(res);
	};

	//update prodcut
	updateProduct = async (req, res, next) => {
		return new SuccessResponse({
			message: "Updated product successfully!",
			metadata: await ProductServiceLv2.updateProduct(
				req.body.product_type,
				req.params.productId,
				{
					...req.body,
					product_shop: req.user.userId,
				}
			),
		}).send(res);
	};

	// PUT

	publishProductByShop = async (req, res, next) => {
		return new SuccessResponse({
			message: "Published product successfully!",
			metadata: await ProductServiceLv2.publishProductByShop({
				product_shop: req.user.userId,
				product_id: req.params.id,
			}),
		}).send(res);
	};

	unpublishProductByShop = async (req, res, next) => {
		return new SuccessResponse({
			message: "Unpublish product successfully!",
			metadata: await ProductServiceLv2.unpublishProductByShop({
				product_shop: req.user.userId,
				product_id: req.params.id,
			}),
		}).send(res);
	};

	// END PUT

	// Query
	/**
	 * @desc Get all Drafts for shop
	 * @param { Number } limit
	 * @returns {JSON}
	 */
	getAllDraftsForShop = async (req, res, next) => {
		return new SuccessResponse({
			message: "Get list all drafts for shop success!",
			metadata: await ProductServiceLv2.findAllDraftForShop({
				product_shop: req.user.userId,
			}),
		}).send(res);
	};

	getAllPublishedForShop = async (req, res, next) => {
		return new SuccessResponse({
			message: "Get list all published for shop success!",
			metadata: await ProductServiceLv2.findAllPublishedForShop({
				product_shop: req.user.userId,
			}),
		}).send(res);
	};

	getListSearchProduct = async (req, res, next) => {
		return new SuccessResponse({
			message: "Get list search product for shop success!",
			metadata: await ProductServiceLv2.searchProduct(req.params),
		}).send(res);
	};

	findAllProducts = async (req, res, next) => {
		return new SuccessResponse({
			message: "Get list find all Products for shop success!",
			metadata: await ProductServiceLv2.findAllProducts(req.query),
		}).send(res);
	};

	findProduct = async (req, res, next) => {
		return new SuccessResponse({
			message: "Get list find Product for shop success!",
			metadata: await ProductServiceLv2.findProduct({
				product_id: req.params.product_id,
			}),
		}).send(res);
	};
	// End query
}

module.exports = new DiscountController();

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

		if (error) {
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

	updateDiscount = async (req, res, next) => {
		return new SuccessResponse({
			message: "Update discount successfully!",
			metadata: await DiscountService.updateDiscountCode({
				discount_id: req.params.id,
				payload: {
					...req.body,
					discount_shopId: req.user.userId,
				},
			}),
		}).send(res);
	};

	getAllDiscountCodes = async (req, res, next) => {
		return new SuccessResponse({
			message: "Get all discount code successfully!",
			metadata: await DiscountService.getAllDiscountCodeByShop({
				...req.body,
				shopId: req.user.userId,
			}),
		}).send(res);
	};

	getDiscountAmount = async (req, res, next) => {
		return new SuccessResponse({
			message: "Get discount amount successfully!",
			metadata: await DiscountService.getDiscountAmount({
				...req.body,
			}),
		}).send(res);
	};

	deleteDiscount = async (req, res, next) => {
		return new SuccessResponse({
			message: "Delete discount successfully!",
			metadata: await DiscountService.deleteDiscountCode({
				...req.body,
			}),
		}).send(res);
	};

	cancelDiscountCode = async (req, res, next) => {
		return new SuccessResponse({
			message: "Cancel discount successfully!",
			metadata: await DiscountService.cancelDiscountCode({
				...req.body,
			}),
		}).send(res);
	};
}

module.exports = new DiscountController();

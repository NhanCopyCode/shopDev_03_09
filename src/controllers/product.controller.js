"use strict";

// const ProductService = require("../services/product.service");
const ProductServiceLv2 = require("../services/product.service.xxx");
const { OK, CREATED, SuccessResponse } = require("../core/success.response.js");
class ProductController {
	createProduct = async (req, res, next) => {
		// return new SuccessResponse({
		// 	message: "Create product successfully!",
		// 	metadata: await ProductService.createProduct({
		// 		type: req.body.product_type,
		// 		payload: {
		// 			...req.body,
		// 			product_shop: req.user.userId
		// 		},
		// 	}),
		// }).send(res);

		return new SuccessResponse({
			message: "Create product successfully!",
			metadata: await ProductServiceLv2.createProduct({
				type: req.body.product_type,
				payload: {
					...req.body,
					product_shop: req.user.userId,
				},
			}),
		}).send(res);
	};
}

module.exports = new ProductController();

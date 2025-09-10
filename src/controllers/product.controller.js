"use strict";

const ProductService = require("../services/product.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response.js");
class ProductController {
	createProduct = async (req, res, next) => {
		return new SuccessResponse({
			message: "Create product successfully!",
			metadata: await ProductService.createProduct({
				type: req.body.product_type,
				payload: req.body,
			}),
		}).send(res);
	};
}

module.exports = new ProductController();

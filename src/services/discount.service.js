"use strict";

const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { convertToObjectIdMongoose } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
	findAllDiscountCodesSelect,
	findAllDiscountCodesUnSelect,
} = require("../models/repositories/discount.repo");

/*
    Discount service
    1. Generator  discount code [Shop/Admin]
    2. Get discount amount
    3. Get all discount code [User | Shop]
    4. Verify discount code [user]
    5. Delete discount Code [Shop/Admin]
    6. Cancel discount [user]
*/

class DiscountService {
	static async createDiscountCode({ payload }) {
		const {
			code,
			start_date,
			end_date,
			is_active,
			min_order_value,
			product_ids,
			shopId,
			applies_to,
			name,
			description,
			type,
			value,
			max_value,
			max_uses,
			uses_count,
			users_used,
			max_uses_per_users,
		} = payload;
		console.log("payload:", payload);

		const now = new Date();
	

		// create index for discount code
		const foundDiscount = await discountModel
			.findOne({
				discount_code: code,
				discount_shopId: convertToObjectIdMongoose(shopId),
			})
			.lean();
		if (foundDiscount && foundDiscount.discount_is_active == true)
			throw new BadRequestError("Discount already exist");

		const newDiscount = await discountModel.create({
			discount_name: name,
			discount_description: description,
			discount_type: type,
			discount_value: value,
			discount_code: code,
			discount_start_date: new Date(start_date),
			discount_end_date: new Date(end_date),
			discount_max_uses: max_uses,
			discount_uses_count: uses_count,
			discount_users_used: users_used,
			discount_max_uses_per_user: max_uses_per_users,
			discount_shopId: shopId,
			discount_is_active: is_active,
			discount_applies_to: applies_to,
			discount_productIds: product_ids,
			discount_min_order_value: min_order_value,
			discount_max_value: max_value,
		});

		return newDiscount;
	}

	static async updateDiscountCode({ discount_id, payload }) {}

	// Get all discount available with product
	static async getAllDiscountCodesWithProduct({
		code,
		shopId,
		userId,
		limit,
		page,
	}) {
		// create index for discount_code
		const foundDiscount = discountModel
			.findOne({
				discount_applies_to: code,
				discount_shopId: Types.ObjectId(shopId),
			})
			.lean();

		if (!foundDiscount || foundDiscount.discount_is_active)
			throw new NotFoundError("Discount not exists!");

		const { discount_applies_to, discount_productIds } = foundDiscount;
		let products;
		if (discount_applies_to === "all") {
			// get all product
			products = await findAllProducts({
				filter: {
					product_shop: convertToObjectIdMongoose(shopId),
					isPublished: true,
				},
				limit: +limit,
				page: +page,
				sort: "ctime",
				select: ["product_name"],
			});
		}

		if (discount_applies_to === "specific") {
			// get product by productIds
			products = await findAllProducts({
				filter: {
					_id: { $in: discount_productIds },
					isPublished: true,
				},
				limit: +limit,
				page: +page,
				sort: "ctime",
				select: ["product_name"],
			});
		}
	}

	// get all discount code of shop
	static async getAllDiscountCodeByShop({ limit, page, shopId }) {
		const discounts = await findAllDiscountCodesUnSelect({
			limit: +limit,
			page: +page,
			filter: {
				discount_shopId: convertToObjectIdMongoose(shopId),
				discount_is_active: true,
			},
			unSelect: ["__v", "discount_shopId"],
			model: discountModel,
		});

		return discounts;
	}
}

module.exports = DiscountService;

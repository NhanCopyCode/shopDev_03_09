"use strict";

const { Types } = require("mongoose");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { convertToObjectIdMongoose } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
	findAllDiscountCodesSelect,
	findAllDiscountCodesUnSelect,
	findDiscount,
	checkDiscountExist,
	updateDiscountRepo,
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

	static async updateDiscountCode({ discount_id, payload }) {
		return await updateDiscountRepo({ discount_id, payload });
	}

	// Get all discount available with product
	static async getAllDiscountCodesWithProduct({
		code,
		shopId,
		userId,
		limit,
		page,
	}) {
		console.log("code: ", code);
		console.log("shopId: ", shopId);
		// create index for discount_code
		const foundDiscount = await discountModel
			.findOne({
				discount_code: code,
				discount_shopId: convertToObjectIdMongoose(shopId),
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

		console.log("products in discount service:", products);
		return products;
	}

	// get all discount code of shop
	static async getAllDiscountCodeByShop({ limit, page, shopId }) {
		const discounts = await findAllDiscountCodesSelect({
			limit: +limit,
			page: +page,
			filter: {
				discount_shopId: convertToObjectIdMongoose(shopId),
				discount_is_active: true,
			},
			select: ["discount_code", "discount_name", "discount description"],
			model: discountModel,
		});

		return discounts;
	}

	/*
		Apply discount code
		products = [
			{
				productId,
				shopId,
				quantity,
				price,
				name (optional)
			},
			{
				productId,
				shopId,
				quantity,
				price,
				name (optional)
			},
		]
	*/
	static async getDiscountAmount({ code, userId, shopId, products }) {
		const foundDiscount = await checkDiscountExist(discountModel, {
			discount_code: code,
			discount_shopId: new Types.ObjectId(shopId),
		});

		if (!foundDiscount) throw new NotFoundError("Discount doesn't exist!");

		const {
			discount_is_active,
			discount_max_uses,
			discount_start_date,
			discount_end_date,
			discount_min_order_value,
			discount_max_uses_per_user,
			discount_users_used,
			discount_type,
			discount_value,
		} = foundDiscount;
		if (!discount_is_active) throw new NotFoundError("Discount expired!");
		if (!discount_max_uses) throw new NotFoundError("Discount are out!");

		const now = new Date();
		if (
			now < new Date(discount_start_date) ||
			now > new Date(discount_end_date)
		) {
			throw new NotFoundError("Discount expired!");
		}

		// check xem co set gia tri toi thieu hay khong
		let totalOrder = 0;
		if (discount_min_order_value > 0) {
			totalOrder = products.reduce((acc, product) => {
				return acc + product.quantity * product.price;
			}, 0);

			if (totalOrder < discount_min_order_value) {
				throw new NotFoundError(
					`Discount require minimum value: ${discount_min_order_value}`
				);
			}
		}

		if (discount_max_uses_per_user > 0) {
			const userUsedDiscountCount = discount_users_used.filter(
				(user) => user.userId == userId
			).length;

			if (userUsedDiscountCount === discount_max_uses_per_user) {
				throw new NotFoundError("Discount usage limit reached!");
			}
		}

		// check discount type is : fixed_amount or percent
		const amount =
			discount_type === "fixed_amount"
				? discount_value
				: totalOrder * (discount_value / 100);

		return {
			totalOrder,
			discount: amount,
			totalPrice: totalOrder - amount,
		};
	}

	static async deleteDiscountCode({ shopId, codeId }) {
		const deleted = await discountModel.findOneAndDelete({
			discount_shopId: convertToObjectIdMongoose(shopId),
			discount_code: codeId,
		});

		return deleted;
	}

	/*
		User cancel discount code
	*/
	static async cancelDiscountCode({ shopId, codeId, userId }) {
		const foundDiscount = await checkDiscountExist({
			model: discount,
			filter: {
				discount_code: codeId,
				discount_shopId: convertToObjectIdMongoose(shopId),
			},
		});

		if (!foundDiscount) throw new NotFoundError("Discount doesn't exist!");

		const result = await discountModel.findByIdAndUpdate(
			foundDiscount._id,
			{
				$pull: {
					discount_users_used: userId,
				},
				$inc: {
					discount_max_uses: 1,
					discount_users_used: -1,
				},
			}
		);

		return result;
	}
}

module.exports = DiscountService;

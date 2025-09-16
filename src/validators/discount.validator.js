const Joi = require("joi");

const discountSchema = Joi.object({
	code: Joi.string().min(3).max(50).required().messages({
		"string.empty": "Discount code is required",
		"string.min": "Discount code must have at least 3 characters",
		"string.max": "Discount code cannot exceed 50 characters",
	}),

	name: Joi.string().required().messages({
		"string.empty": "Discount name is required",
	}),

	description: Joi.string().allow(null, "").optional(),

	type: Joi.string().valid("fixed_amount", "percentage").required().messages({
		"any.only": "Type must be either 'fixed_amount' or 'percentage'",
	}),

	value: Joi.number().positive().required().messages({
		"number.base": "Value must be a number",
		"number.positive": "Value must be greater than 0",
	}),

	max_value: Joi.number().positive().optional(),

	start_date: Joi.date().iso().required().messages({
		"date.base": "Start date must be a valid date",
		"any.required": "Start date is required",
	}),

	end_date: Joi.date()
		.iso()
		.greater(Joi.ref("start_date"))
		.required()
		.messages({
			"date.greater": "End date must be after start date",
			"any.required": "End date is required",
		}),

	max_uses: Joi.number().integer().min(1).required(),
	uses_count: Joi.number().integer().min(0).default(0),
	users_used: Joi.array().items(Joi.string()).default([]),

	max_uses_per_users: Joi.number().integer().min(1).required(),

	is_active: Joi.boolean().default(true),

	applies_to: Joi.string().valid("all", "specific").required(),

	product_ids: Joi.array().items(Joi.string()).default([]),

	min_order_value: Joi.number().min(0).default(0),
});

module.exports = { discountSchema };

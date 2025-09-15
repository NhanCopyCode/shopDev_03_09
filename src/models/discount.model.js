const mongoose = require("mongoose"); // Erase if already required
const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";
// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema(
	{
		discount_name: {
			type: String,
			required: true,
		},
		discount_description: {
			type: String,
			required: true,
		},
		discount_type: {
			type: String,
			default: "fixed_amount",
		},
		discount_value: {
			type: Number,
			required: true,
		}, // 10.000 VND or 10%
		discount_code: {
			type: String,
			required: true,
		},
		discount_start_date: {
			type: Date,
			required: true,
		},
		discount_end_date: {
			type: Date,
			required: true,
		},
		discount_max_uses: {
			// so luong discount duoc ap dung
			type: Number,
			required: true,
		},
		discount_uses_count: {
			// so luong discount da su dung
			type: Number,
			required: true,
		},
		discount_users_used: {
			// ai da su dung ?
			type: Array,
			default: [],
		},
		discount_max_uses_per_user: {
			// so luong cho phep toi da cho 1 user
			type: Number,
			required: true,
		},
		discount_shopId: { type: mongoose.Schema.ObjectId, ref: "Shop" },
		discount_is_active: {
			type: Boolean,
			default: true,
		},
		discount_applies_to: {
			type: String,
			required: true,
			enum: ["All", "Specify"],
		},
		discount_productId: { // san pham duoc ap dung discount
			type: Array,
			default: [],
		},
	},
	{
		collection: COLLECTION_NAME,
		timestamps: true,
	}
);

module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);

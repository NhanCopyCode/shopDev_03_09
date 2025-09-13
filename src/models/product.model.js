const mongoose = require("mongoose");
const slugify = require("slugify");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
const productSchema = new mongoose.Schema(
	{
		product_name: {
			type: String,
			required: true,
		},
		product_thumb: {
			type: String,
			required: true,
		},
		product_description: {
			type: String,
		},
		product_slug: {
			type: String,
		},
		product_price: {
			type: Number,
			required: true,
		},
		product_quantity: {
			type: Number,
			required: true,
		},
		product_type: {
			type: String,
			required: true,
			enum: ["Electronics", "Clothing", "Furniture"],
		},
		product_shop: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shop",
		},
		product_attributes: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
		},
		// More
		product_ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, "Rating must be above 1.0"],
			max: [5, "Rating must be below 5.0"],
			set: (val) => Math.round(val * 10) / 10,
		},
		product_variations: {
			type: Array,
			default: [],
		},
		isDraft: {
			type: Boolean,
			default: true,
			index: true,
			select: false,
		},
		isPublished: {
			type: Boolean,
			default: false,
			index: true,
			select: false,
		},
	},
	{
		collection: COLLECTION_NAME,
		timestamps: true,
	}
);
// create index for search
productSchema.index({
	product_name: 'text',
	product_description: 'text',
})

// Document middleware: run before save() or create() ...
productSchema.pre("save", function (next) {
	this.product_slug = slugify(this.product_name, { lower: true });
	next();
});

const clothingSchema = new mongoose.Schema(
	{
		brand: {
			type: String,
			required: true,
		},
		product_shop: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shop",
		},
		size: String,
		material: String,
	},

	{
		collection: "Clothes",
		timestamps: true,
	}
);

const electronicSchema = new mongoose.Schema(
	{
		manufacturer: {
			type: String,
			required: true,
		},
		product_shop: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shop",
		},
		model: String,
		color: String,
	},
	{
		collection: "Electronics",
		timestamps: true,
	}
);

const furnitureSchema = new mongoose.Schema(
	{
		brand: {
			type: String,
			required: true,
		},
		product_shop: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shop",
		},
		size: String,
		material: String,
	},
	{
		collection: "Furniture",
		timestamps: true,
	}
);

//Export the model
module.exports = {
	product: mongoose.model(DOCUMENT_NAME, productSchema),
	clothing: mongoose.model("Clothing", clothingSchema),
	electronic: mongoose.model("Electronic", electronicSchema),
	furniture: mongoose.model("Furniture", furnitureSchema),
};

const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";
// Declare the Schema of the Mongo model
var inventorySchema = new mongoose.Schema(
	{
		inventory_productId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
		},
		inventory_location: {
			type: String,
			default: "Unknown",
		},
		inventory_stock: {
			type: Number,
			required: true,
		},
		inventory_shopId: {
			type: mongoose.Types.ObjectId,
			ref: "Shop",
		},
		inventory_reservations: {
			type: Array,
			default: [],
		},
	},
	{
		collection: COLLECTION_NAME,
		timestamps: true,
	}
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, inventorySchema);

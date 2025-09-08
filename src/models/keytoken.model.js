"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "KeyToken";
const COLLECTION_NAME = "KeyTokens";
// Declare the Schema of the Mongo model
var keyTokenSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "Shop",
		},
		privateKey: {
			type: String,
		},
		publicKey: {
			type: String,
		},
		refreshTokenUsed: {
			type: Array,
			default: [],
		},
		refreshToken: {
			type: String,
			require: true,
		},
	},
	{
		timestamps: true,
		collection: COLLECTION_NAME,
	}
);

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);

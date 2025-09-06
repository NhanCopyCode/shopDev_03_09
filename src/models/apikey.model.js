'use strict'

const mongoose = require('mongoose'); 

const DOCUMENT_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";

var apiKeySchema = new mongoose.Schema(
	{
		key: {
			type: String,
			required: true,
			unique: true,
		},
		status: {
			type: Boolean,
			default: true,
		},
		permissions: {
			type: [String],
            require: true,
            enum: ['0000', '1111','2222']
		},
	},
	{
		collection: COLLECTION_NAME,
		timestamps: true,
	}
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, apiKeySchema);
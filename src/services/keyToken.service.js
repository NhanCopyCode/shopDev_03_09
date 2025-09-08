"use strict";

const { filter } = require("lodash");
const keyTokenModel = require("../models/keytoken.model");

class KeyTokenService {
	static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
		try {
			// lv0
			// const token = await keyTokenModel.create({
			//     userId, publicKey, privateKey
			// })

			// lv xxx
			const filter = {
				user: userId,
			};
			const update = {
				privateKey,
				publicKey,
				refreshTokenUsed: [],
				refreshToken,
			};
			const options = { upsert: true, new: true };
			const tokens = await keyTokenModel.findOneAndUpdate(
				filter,
				update,
				options
			);

			return tokens ? tokens.publicKey : null;

		} catch (error) {
			console.error("Error in createKeyToken:", error.message);
		}
	};
}

module.exports = KeyTokenService;

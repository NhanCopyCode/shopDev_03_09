"use strict";

const { filter } = require("lodash");
const { Types } = require("mongoose");
const keyTokenModel = require("../models/keytoken.model");

class KeyTokenService {
	static createKeyToken = async ({
		userId,
		publicKey,
		privateKey,
		refreshToken,
	}) => {
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

	static findByUserId = async (userId) => {
		return await keyTokenModel.findOne({
			user: new Types.ObjectId(userId),
		});
	};

	static removeTokenById = async (id) => {
		const result = await keyTokenModel.deleteOne({
			_id: new Types.ObjectId(id),
		});
		return result;
	};

	static findByRefreshTokenUsed = async (refreshToken) => {
		return await keyTokenModel
			.findOne({ refreshTokenUsed: refreshToken })
			.lean();
	};
	static findByRefreshToken = async (refreshToken) => {
		return await keyTokenModel.findOne({ refreshToken });
	};

	static deleteKeyByUserid = async (userId) => {
		return await keyTokenModel
			.findOneAndDelete({ user: new Types.ObjectId(userId) })
			.lean();
	};
}

module.exports = KeyTokenService;

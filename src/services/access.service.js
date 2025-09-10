"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
	BadRequestError,
	AuthFailureError,
	ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
	SHOP: "SHOP",
	WRITER: "WRITER",
	EDITOR: "EDITOR",
	ADMIN: "ADMIN",
};

class AccessService {
	/*
		check this token used ?
	*/
	static handleRefreshToken = async (refreshToken) => {
		console.log("refreshToken:", refreshToken);

		// Check if token have been reused ?
		const foundToken = await KeyTokenService.findByRefreshTokenUsed(
			refreshToken
		);
		// if exist token
		if (foundToken) {
			// decode token
			const { userId, email } = await verifyJWT(
				refreshToken,
				foundToken.privateKey
			);
			console.log("userId and email : ", userId, email);

			// remove all token in keyStore
			await KeyTokenService.deleteKeyByUserid(userId);

			throw new ForbiddenError(
				"Something went wrong! Please, login again"
			);
		}

		// if token don't have been reused?
		const holderToken = await KeyTokenService.findByRefreshToken(
			refreshToken
		);
		console.log("holderToken:", holderToken);
		if (!holderToken) throw new AuthFailureError("Shop not register!");

		// verify token
		const { userId, email } = await verifyJWT(
			refreshToken,
			holderToken.privateKey
		);
		// Check userId
		const foundShop = await findByEmail({ email });
		if (!foundShop) throw new AuthFailureError("Shop not register!");

		// create new tokens pair
		const tokens = await createTokenPair(
			{ userId, email },
			holderToken.publicKey,
			holderToken.privateKey
		);

		await holderToken.updateOne({
			$set: {
				refreshToken: tokens.refreshToken,
			},
			$addToSet: {
				refreshTokenUsed: refreshToken,
			},
		});

		return {
			user: {
				userId,
				email,
			},
			tokens,
		};
	};

	static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
		const { userId, email } = user;
		console.log("refreshToken", refreshToken);
		console.log("user", user);
		console.log("keyStore", keyStore);

		if (keyStore.refreshTokenUsed.includes(refreshToken)) {
			await KeyTokenService.deleteKeyByUserid(userId);

			throw new ForbiddenError(
				"Something went wrong! Please, login again"
			);
		}

		if (keyStore.refreshToken !== refreshToken) {
			throw new AuthFailureError("Shop not register 1!");
		}

		const foundShop = await findByEmail({ email });
		if (!foundShop) throw new AuthFailureError("Shop not register 2!");

		// Check if token have been reused ?
		const foundToken = await KeyTokenService.findByRefreshTokenUsed(
			refreshToken
		);
		// if exist token
		if (foundToken) {
			// decode token
			const { userId, email } = await verifyJWT(
				refreshToken,
				foundToken.privateKey
			);
			console.log("userId and email : ", userId, email);

			// remove all token in keyStore
			await KeyTokenService.deleteKeyByUserid(userId);

			throw new ForbiddenError(
				"Something went wrong! Please, login again"
			);
		}

		const tokens = await createTokenPair(
			{ userId, email },
			keyStore.publicKey,
			keyStore.privateKey
		);

		await keyStore.updateOne({
			$set: {
				refreshToken: tokens.refreshToken,
			},
			$addToSet: {
				refreshTokenUsed: refreshToken,
			},
		});

		return {
			user: {
				userId,
				email,
			},
			tokens,
		};
	};
	/*
		1. Check email in dbs
		2. Match password 
		3. Create AccessToken and Refresh Token
		4. Generate tokens
		5. get data return login

	*/
	static logout = async (keyStore) => {
		const delKey = await KeyTokenService.removeTokenById(keyStore._id);
		return delKey;
	};
	static login = async ({ email, password, refreshToken = null }) => {
		const foundShop = await findByEmail({ email });
		if (!foundShop) throw new BadRequestError("Shop not register!");

		const match = bcrypt.compare(password, foundShop.password);
		if (!match) throw new AuthFailureError("Authentication error!");

		const privateKey = crypto.randomBytes(64).toString("hex");
		const publicKey = crypto.randomBytes(64).toString("hex");
		const tokens = await createTokenPair(
			{
				userId: foundShop._id,
				email,
			},
			publicKey,
			privateKey
		);

		await KeyTokenService.createKeyToken({
			userId: foundShop._id,
			privateKey,
			publicKey,
			refreshToken: tokens.refreshToken,
		});

		return {
			shop: getInfoData({
				fields: ["_id", "name", "email"],
				object: foundShop,
			}),

			tokens,
		};
	};

	static signUp = async ({ name, email, password }) => {
		// step 1: check email exist
		const holderShop = await shopModel.findOne({ email }).lean();
		if (holderShop) {
			throw new BadRequestError("Error: Shop already registered!");
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const newShop = await shopModel.create({
			name,
			email,
			password: passwordHash,
			roles: [RoleShop.SHOP],
		});

		if (newShop) {
			// create privateKey, publicKey
			// const { publicKey, privateKey } = crypto.generateKeyPairSync(
			// 	"rsa",
			// 	{
			// 		modulusLength: 4096,
			// 		publicKeyEncoding: {
			// 			type: "pkcs1",
			// 			format: "pem",
			// 		},
			// 		privateKeyEncoding: {
			// 			type: "pkcs8",
			// 			format: "pem",
			// 		},
			// 	}
			// );
			const privateKey = crypto.randomBytes(64).toString("hex");
			const publicKey = crypto.randomBytes(64).toString("hex");

			const keyStore = await KeyTokenService.createKeyToken({
				userId: newShop._id,
				publicKey,
				privateKey,
			});

			if (!keyStore) {
				return {
					code: "xxx",
					message: "keyStore error",
				};
			}

			// const publicKeyObject = crypto.createPublicKey(publicKeyString);
			// console.log("publickeyObject: ", publicKeyObject);

			// create token pair
			const tokens = await createTokenPair(
				{
					userId: newShop._id,
					email,
				},
				publicKey,
				privateKey
			);
			console.log("Create token success: ", tokens);

			return {
				code: 201,
				metadata: {
					shop: getInfoData({
						fields: ["_id", "name", "email"],
						object: newShop,
					}),

					tokens,
				},
			};
		}

		return {
			code: 200,
			metadata: null,
		};
	};
}

module.exports = AccessService;

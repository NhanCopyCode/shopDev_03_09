"use strict";
const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler.js");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const KeyTokenService = require("../services/keyToken.service.js");

const HEADER = {
	API_KEY: "x-api-key",
	CLIENT_ID: "x-client-id",
	AUTHORIZATION: "authorization",
	REFRESH_TOKEN: "x-rtoken-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
	try {
		const accessToken = await JWT.sign(payload, publicKey, {
			expiresIn: "2 days",
		});
		const refreshToken = await JWT.sign(payload, privateKey, {
			expiresIn: "7 days",
		});

		JWT.verify(accessToken, publicKey, (err, decode) => {
			if (err) {
				console.error(`error verify::`, err);
			} else {
				console.log(`verify decode::`, decode);
			}
		});

		return { accessToken, refreshToken };
	} catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
	/*
		1. Check userId missing
		2. Get access token
		3. Verify tokens
		4. Check user in dbs ?
		5. Check keystore with userId
		6. All OK -> return next()

	*/
	const userId = req.headers[HEADER.CLIENT_ID];
	if (!userId) throw new AuthFailureError("Invalid request");

	const keyStore = await KeyTokenService.findByUserId(userId);
	if (!keyStore) throw new NotFoundError("Not found keyStore");

	const accessToken = req.headers[HEADER.AUTHORIZATION];
	if (!accessToken) throw new AuthFailureError("Invalid request");

	try {
		const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
		// JWT.verify(accessToken, keyStore.publicKey, (err, decode) => {
		// 	if (err) {
		// 		console.error(`error verify::`, err);
		// 	} else {
		// 		console.log(`verify decode::`, decode);
		// 	}
		// });
		if (userId !== decodeUser.userId) {
			throw new AuthFailureError("Invalid user");
		}

		req.keyStore = keyStore;
		return next();
	} catch (error) {
		throw error;
	}
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
	/*
		1. Check userId missing
		2. Get access token
		3. Verify tokens
		4. Check user in dbs ?
		5. Check keystore with userId
		6. All OK -> return next()

	*/
	const userId = req.headers[HEADER.CLIENT_ID];
	if (!userId) throw new AuthFailureError("Invalid request");

	const keyStore = await KeyTokenService.findByUserId(userId);
	if (!keyStore) throw new NotFoundError("Not found keyStore");

	const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
	if (refreshToken) {
		try {
			const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
			if (userId !== decodeUser.userId) {
				throw new AuthFailureError("Invalid user!");
			}

			req.keyStore = keyStore;
			req.refreshToken = refreshToken;
			req.user = decodeUser;
			return next();
		} catch (error) {
			throw error;
		}
	}

	
});

const verifyJWT = async (token, keySecret) => {
	return await JWT.verify(token, keySecret);
};

module.exports = {
	createTokenPair,
	authentication,
	verifyJWT,
	authenticationV2,
};

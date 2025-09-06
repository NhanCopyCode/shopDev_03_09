"use strict";

const { findById } = require("../services/apikey.service");
const HEADER = {
	API_KEY: "x-api-key",
	AUTHORIZATION: "authorization",
};
const apiKey = async (req, res, next) => {
	try {
		const apiKey = req.headers[HEADER.API_KEY]?.toString();
		if (!apiKey) {
			return res.status(403).json({
				message: "Forbidden Error",
			});
		}
		const objKey = await findById(apiKey);
		if (!objKey) {
			return res.status(403).json({
				message: "Forbidden Error",
			});
		}
		res.objKey = objKey;
		return next();
	} catch (error) {}
};

module.exports = {
	apiKey,
};

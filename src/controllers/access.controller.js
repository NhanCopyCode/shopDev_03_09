"use strict";

const AccessService = require("../services/access.service");
const { OK, CREATED, SuccessResponse } = require("../core/success.response.js");
class AccessController {
	login = async (req, res, next) => {
		new SuccessResponse({
			message: "Login successfully!",
			metadata: await AccessService.login(req.body),
		}).send(res);
	};
	signUp = async (req, res, next) => {
		new CREATED({
			message: "Shop signup successfully!",
			metadata: await AccessService.signUp(req.body),
			options: {
				limit: 5,
			},
		}).send(res);
		// return res.status(200).json(await AccessService.signUp(req.body));
	};
}

module.exports = new AccessController();

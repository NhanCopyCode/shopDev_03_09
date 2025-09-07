"use strict";

const AccessService = require("../services/access.service");
const { OK, CREATED } = require("../core/success.response.js");
class AccessController {
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

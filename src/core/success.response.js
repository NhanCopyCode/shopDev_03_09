"use strict";
const StatusCode = {
	OK: 200,
	CREATED: 201,
};

const ReasonStatusCode = {
	OK: "Created!",
	CREATED: "Success",
};
class SuccessResponse {
	constructor({
		message,
		statusCode = StatusCode.OK,
		reasonStatusCode = ReasonStatusCode.OK,
		metadata = {},
	}) {
		this.message = message ? message : reasonStatusCode;
		this.statusCode = statusCode;
		this.reasonStatusCode = reasonStatusCode;
		this.metadata = metadata || {};
	}

	send(res, header = {}) {
		return res.status(this.statusCode).json(this);
	}
}

class OK extends SuccessResponse {
	constructor({ message, metadata }) {
		super({ message, metadata });
	}
}

class CREATED extends SuccessResponse {
	constructor({
		options = {},
		message,
		statusCode = StatusCode.CREATED,
		reasonStatusCode = ReasonStatusCode.CREATED,
		metadata,
	}) {
		super({ message, statusCode, reasonStatusCode, metadata });
		this.options = options;
	}
}

module.exports = {
	OK,
	CREATED,
	SuccessResponse
};

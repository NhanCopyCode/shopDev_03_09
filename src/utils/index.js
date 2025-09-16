"use strict";

const _ = require("lodash");
const { Types } = require("mongoose");

const convertToObjectIdMongoose = (id) => {
	return new Types.ObjectId(id);
}

const getInfoData = ({ fields = [], object = {} }) => {
	return _.pick(object, fields);
};

const getSelectData = (select = []) => {
	return Object.fromEntries(select.map((el) => [el, 1]));
};

const getUnSelectData = (select = []) => {
	return Object.fromEntries(select.map((el) => [el, 0]));
};


const removeUndefineObject = (obj) => {
	Object.keys(obj).forEach((key) => {
		if (obj[key] == null) delete obj[key];
	});

	return obj;
};

const updateNestedObjectParser = (obj) => {
	console.log("[1]::", obj);
	const final = {};
	Object.keys(obj).forEach((k) => {
		console.log("[3]::", k);
		if (
			typeof obj[k] === "object" &&
			obj[k] !== null &&
			!Array.isArray(obj[k])
		) {
			console.log("object[k]", obj[k]);
			const response = updateNestedObjectParser(obj[k]);
			Object.keys(obj[k]).forEach((a) => {
				console.log("[4]::", a);
				final[`${k}.${a}`] = response[a];
			});
		} else if (obj[k] !== undefined) {
			// chỉ set nếu thực sự có dữ liệu
			final[k] = obj[k];
		}
	});
	console.log("[2]::", obj);

	return final;
};

const getJoiErrorMessage = (error) => {
	return error.details.map(err => err.message);
}

module.exports = {
	getInfoData,
	getSelectData,
	getUnSelectData,
	removeUndefineObject,
	updateNestedObjectParser,
	convertToObjectIdMongoose,
	getJoiErrorMessage,
};

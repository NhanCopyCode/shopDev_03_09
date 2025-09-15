"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
	return _.pick(object, fields);
};

const getSelectData = (select = []) => {
	return Object.fromEntries(select.map((el) => [el, 1]));
};

const getUnSelectData = (select = []) => {
	return Object.fromEntries(select.map((el) => [el, 0]));
};

// const removeUndefineObject = (object) => {
// 	console.log("object before remove: ", object);

// 	Object.keys(object).forEach((key) => {
// 		const value = object[key];

// 		if (value === null || value === undefined) {
// 			delete object[key];
// 		}

// 		else if (typeof value === "object" && !Array.isArray(value)) {
// 			object[key] = removeUndefineObject(value); // recursion
// 			if (Object.keys(object[key]).length === 0) {
// 				delete object[key];
// 			}
// 		}
// 	});

// 	console.log("object after remove: ", object);
// 	return object;
// };

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

module.exports = {
	getInfoData,
	getSelectData,
	getUnSelectData,
	removeUndefineObject,
	updateNestedObjectParser,
};

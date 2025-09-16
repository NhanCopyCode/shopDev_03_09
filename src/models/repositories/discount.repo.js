"use strict";

const { Types } = require("mongoose");
const { getUnSelectData, getSelectData, removeUndefineObject } = require("../../utils");
const discountModel = require("../discount.model");

const updateDiscountRepo = async ({ discount_id, payload }) => {
	return await discountModel.findByIdAndUpdate(discount_id, removeUndefineObject(payload), { new: true});
};

const findAllDiscountCodesUnSelect = async ({
	limit = 50,
	sort = "ctime",
	page = 1,
	filter,
	unSelect,
	model,
}) => {
	const skip = (page - 1) * limit;
	const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
	const documents = await model
		.find(filter)
		.sort(sortBy)
		.skip(skip)
		.limit(limit)
		.select(getUnSelectData(unSelect))
		.lean()
		.exec();

	return documents;
};

const findAllDiscountCodesSelect = async ({
	limit = 50,
	sort = "ctime",
	page = 1,
	filter,
	select,
	model,
}) => {
	const skip = (page - 1) * limit;
	const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
	const documents = await model
		.find(filter)
		.sort(sortBy)
		.skip(skip)
		.limit(limit)
		.select(getSelectData(select))
		.lean()
		.exec();

	return documents;
};

const checkDiscountExist = async (model, filter) => {
	return await model.findOne(filter).lean();
};

module.exports = {
	findAllDiscountCodesUnSelect,
	findAllDiscountCodesSelect,
	checkDiscountExist,
	updateDiscountRepo,
	updateDiscountRepo,
	updateDiscountRepo,
};

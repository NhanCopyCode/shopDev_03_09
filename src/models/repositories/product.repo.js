"use strict";
const mongoose = require("mongoose");
const {
	product,
	electronic,
	furniture,
	clothing,
} = require("../product.model");
const {
	getSelectData,
	getUnSelectData,
	removeUndefineObject,
	updateNestedObjectParser,
} = require("../../utils");

const findAllDraftsForShop = async ({ query, limit, skip }) => {
	return await queryProduct({
		query,
		limit,
		skip,
	});
};

const findAllPublishedForShop = async ({ query, limit, skip }) => {
	return await queryProduct({
		query,
		limit,
		skip,
	});
};

const publishProductByShop = async ({ product_shop, product_id }) => {
	const foundShop = await product.findOne({
		product_shop: new mongoose.Types.ObjectId(product_shop),
		_id: new mongoose.Types.ObjectId(product_id),
	});

	if (!foundShop) return null;
	foundShop.isDraft = false;
	foundShop.isPublished = true;

	const { modifiedCount } = await foundShop.updateOne(foundShop);
	return modifiedCount;
};

const findAllProducts = async ({ limit = 50, sort = 'ctime', page = 1, filter, select = [] }) => {
	const skip = (page - 1) * limit;
	const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
	const products = await product
		.find(filter)
		.sort(sortBy)
		.skip(skip)
		.limit(limit)
		.select(getSelectData(select))
		.lean()
		.exec();

	return products;
};

// This is my code findProduct
const findProduct = async ({ product_id, unSelect }) => {
	return await product
		.findOne({
			_id: new mongoose.Types.ObjectId(product_id),
		})
		.select(getUnSelectData(unSelect))
		.lean()
		.exec();
};

const updateProductById = async ({
	model,
	product_id,
	objectParams,
	isNew = true,
}) => {
	console.log('object params: ', objectParams);
	return await model.findByIdAndUpdate(
		product_id,
		{
			$set: objectParams,
		},
		{
			new: isNew,
		}
	);
};

// this is tips javascript's code findProduct
// const findProduct = async ({ product_id, unSelect }) => {
// 	return await product.findById(product_id).select(getUnSelect(unSelect)).lean().exec();
// };

const unpublishProductByShop = async ({ product_shop, product_id }) => {
	const foundShop = await product.findOne({
		product_shop: new mongoose.Types.ObjectId(product_shop),
		_id: new mongoose.Types.ObjectId(product_id),
	});

	if (!foundShop) return null;
	foundShop.isDraft = true;
	foundShop.isPublished = false;

	const { modifiedCount } = await foundShop.updateOne(foundShop);
	return modifiedCount;
};

const searchProductByUser = async ({ keySearch }) => {
	const regexSearch = new RegExp(keySearch);
	const results = await product
		.find(
			{
				isPublished: true,
				$text: { $search: regexSearch },
			},
			{ score: { $meta: "textScore" } }
		)
		.sort({ score: { $meta: "textScore" } });

	return results;
};

const queryProduct = async ({ query, limit, skip }) => {
	return await product
		.find(query)
		.populate("product_shop", "name email -_id")
		.sort({ updateAt: -1 })
		.skip(skip)
		.limit(limit)
		.lean()
		.exec();
};

module.exports = {
	findAllDraftsForShop,
	publishProductByShop,
	findAllPublishedForShop,
	unpublishProductByShop,
	searchProductByUser,
	findAllProducts,
	findProduct,
	updateProductById,
};

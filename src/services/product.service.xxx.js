"use strict";
const { BadRequestError } = require("../core/error.response.js");
const {
	product,
	clothing,
	electronic,
	furniture,
} = require("../models/product.model.js");
const { insertInventory } = require("../models/repositories/inventory.repo.js");
const {
	findAllDraftsForShop,
	publishProductByShop,
	findAllPublishedForShop,
	unpublishProductByShop,
	searchProductByUser,
	findAllProducts,
	findProduct,
	updateProductById,
} = require("../models/repositories/product.repo.js");
const {
	removeUndefineObject,
	updateNestedObjectParser,
} = require("../utils/index.js");

// define Factory class to create product
class ProductFactory {
	// lv1
	// static async createProduct({ type, payload }) {
	// 	switch (type) {
	// 		case "Electronics":
	// 			return new Electronics(payload).createProduct();
	// 		case "Clothing":
	// 			return new Clothing(payload).createProduct();
	// 		default:
	// 			throw new BadRequestError(`Invalid product type ${type}`);
	// 	}
	// }

	static productRegistry = {};

	static registerProductType = (type, classRef) => {
		return (this.productRegistry[type] = classRef);
	};

	static createProduct = async ({ type, payload }) => {
		const productClass = this.productRegistry[type];
		if (!productClass)
			throw new BadRequestError(`Invalid product type ${type}`);

		return await new productClass(payload).createProduct();
	};

	static updateProduct = async (type, productId, payload) => {
		const productClass = this.productRegistry[type];
		if (!productClass)
			throw new BadRequestError(`Invalid product type ${type}`);

		return await new productClass(payload).updateProduct(productId);
	};

	// PUT
	static async publishProductByShop({ product_shop, product_id }) {
		return await publishProductByShop({ product_shop, product_id });
	}

	static async unpublishProductByShop({ product_shop, product_id }) {
		return await unpublishProductByShop({ product_shop, product_id });
	}
	// END PUT

	// query
	static async findAllDraftForShop({ product_shop, limit = 50, skip = 0 }) {
		const query = { product_shop, isDraft: true };
		return await findAllDraftsForShop({ query, limit, skip });
	}

	static async findAllPublishedForShop({
		product_shop,
		limit = 50,
		skip = 0,
	}) {
		const query = { product_shop, isPublished: true };
		return await findAllPublishedForShop({ query, limit, skip });
	}

	static async searchProduct({ keySearch }) {
		return await searchProductByUser({ keySearch });
	}

	static async findAllProducts({
		limit = 50,
		sort = "ctime",
		page = 1,
		filter = { isPublished: true },
	}) {
		return await findAllProducts({
			limit,
			sort,
			page,
			filter,
			select: ["product_name", "product_price", "product_thumb"],
		});
	}

	static async findProduct({ product_id }) {
		return await findProduct({ product_id, unSelect: ["__v"] });
	}
}

/*
        product_name: {
            type: String,
            required: true,
        },
        product_thumb: {
            type: String,
            required: true,
        },
        product_description: {
            type: String,
        },
        product_price: {
            type: Number,
            required: true,
        },
        product_quantity: {
            type: Number,
            required: true,
        },
        product_type: {
            type: String,
            required: true,
            enum: ["Electronics", "Clothing", "Furniture"],
        },
        product_shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
        },
        product_attributes: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
*/
// define base product class
class Product {
	constructor({
		product_name,
		product_thumb,
		product_description,
		product_price,
		product_quantity,
		product_type,
		product_shop,
		product_attributes,
	}) {
		this.product_name = product_name;
		this.product_thumb = product_thumb;
		this.product_description = product_description;
		this.product_price = product_price;
		this.product_quantity = product_quantity;
		this.product_type = product_type;
		this.product_shop = product_shop;
		this.product_attributes = product_attributes;
	}

	// create new product
	async createNewProduct(id) {
		const newProduct = await product.create({ ...this, _id: id });
		if (newProduct) {
			// add product stock to inventory collection
			await insertInventory({
				productId: newProduct._id,
				shopId: this.product_shop,
				stock: this.product_quantity,
			});
		}

		return newProduct;
	}

	// update product
	async updateProduct(productId, payload) {
		return await updateProductById({
			model: product,
			product_id: productId,
			objectParams: updateNestedObjectParser(payload),
		});
	}
}

// Define sub-class for different product types Clothing
class Clothing extends Product {
	async createProduct() {
		const newClothing = await clothing.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});
		if (!newClothing)
			throw new BadRequestError("create new Clothing error");

		const newProduct = await super.createNewProduct(newClothing._id);
		if (!newProduct) throw new BadRequestError("create new Product error");

		return newProduct;
	}

	async updateProduct(productId) {
		/*
			{
				a: undefined,
				b: null
			}
		*/
		// 1. remove attrs has null or undefined
		const objectParams = removeUndefineObject(this);

		// 2. Check xem update o cho nao ?
		if (objectParams.product_attributes) {
			// update child
			// await clothing.findByIdAndUpdate(productId, objectParams, {
			// 	new: true,
			// });
			await updateProductById({
				model: clothing,
				product_id: productId,
				objectParams: updateNestedObjectParser(objectParams),
			});
		}

		const updateProduct = await super.updateProduct(
			productId,
			objectParams
		);
		return updateProduct;
	}
}

class Electronics extends Product {
	async createProduct() {
		const newElectronics = await electronic.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});
		if (!newElectronics)
			throw new BadRequestError("create new Electronic error");

		const newProduct = await super.createNewProduct(newElectronics._id);
		if (!newProduct) throw new BadRequestError("create new Clothing error");

		return newProduct;
	}
}

class Furniture extends Product {
	async createProduct() {
		const newFurniture = await furniture.create({
			...this.product_attributes,
			product_shop: this.product_shop,
		});
		if (!newFurniture)
			throw new BadRequestError("create new Electronic error");

		const newProduct = await super.createNewProduct(newFurniture._id);
		if (!newProduct) throw new BadRequestError("create new Clothing error");

		return newProduct;
	}
}

ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;

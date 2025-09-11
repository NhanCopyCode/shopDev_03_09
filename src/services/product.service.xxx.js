"use strict";
const { BadRequestError } = require("../core/error.response.js");
const { product, clothing, electronic, furniture } = require("../models/product.model.js");



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

	static productRegistry = {}

	static registerProductType = (type, classRef) => {
		return  this.productRegistry[type] = classRef;
	}

	static createProduct = async ({ type, payload}) => {
		const productClass = this.productRegistry[type];
		if(!productClass) throw new BadRequestError(`Invalid product type ${type}`);

		return await new productClass(payload).createProduct();
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
		return await product.create({ ...this, _id: id });
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

ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;

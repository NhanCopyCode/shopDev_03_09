"use strict";

const mongoose = require("mongoose");
const { db: {host, port, name} } = require('../configs/config.mongodb');
const connectString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require("../helpers/check.connect");

console.log('connectString: ', connectString);
class Database {
	constructor() {
		this.connect();
	}

	//connect to database
	connect(type = "mongodb") {
		if (1 === 1) {
			mongoose.set("debug", true);
			mongoose.set("debug", {
				color: true,
			});
		}
		mongoose
			.connect(connectString, {
                maxPoolSize: 10
            })
			.then((_) => {
				console.log("Connected Mongodb PRO");
				countConnect();
			})
			.catch(() => console.log("Error Connected Mongodb"));
	}

	static getInstance() {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;

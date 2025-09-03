const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require('compression');

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());



// init db
require('./dbs/init.mongodb.lv0');


// init routes
app.get("/", (req, res, next) => {
    const message = 'Hello tips javascript';

	return res.status(200).json({
		message: message.repeat(1000)
	});
});

// handling errors

module.exports = app;

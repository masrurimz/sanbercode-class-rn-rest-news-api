const config = require("config");
const mongoose = require("mongoose");
const winston = require("winston");

module.exports = function () {
	mongoose
		.connect(config.get("mongoURI"), {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			// useFindAndModify: false,
			// useCreateIndex: true,
		})
		.then(() => winston.info("Connected to MongoDB..."));
};

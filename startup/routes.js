const express = require("express");

const error = require("../middleware/error");
const auth = require("../routes/auth");
const news = require("../routes/news");
const users = require("../routes/users");

module.exports = function (app) {
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.use("/api/auth", auth);
	app.use("/api/news", news);
	app.use("/api/users", users);

	app.use(error);
};

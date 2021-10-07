const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const genre = require("../models/genre");

const News = mongoose.model(
	"News",
	new mongoose.Schema({
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: 5,
			maxlength: 255,
		},
		value: {
			type: String,
			required: true,
			trim: true,
			minlength: 5,
			maxlength: 255,
		},
	}),
);

const schema = Joi.object({
	title: Joi.string().min(5).max(255).required(),
	value: Joi.string().min(5).max(255).required(),
});

function validateValue(movie) {
	return schema.validate(movie);
}

exports.News = News;
exports.validate = validateValue;

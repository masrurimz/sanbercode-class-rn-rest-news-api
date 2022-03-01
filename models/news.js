const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const News = mongoose.model(
	"News",
	new mongoose.Schema({
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 255,
		},
		value: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 255,
		},
	}),
);

const schema = Joi.object({
	title: Joi.string().min(3).max(255).required(),
	value: Joi.string().min(3).max(255).required(),
});

function validateValue(news) {
	return schema.validate(news);
}

exports.News = News;
exports.validate = validateValue;

const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const Joi = require("joi");
const router = express.Router();

const { User } = require("../models/user");
const validate = require("../middleware/validate");
const {
	error: errorMessage,
	success,
	validation,
} = require("../models/responseApi");

router.post("/", validate(validateAuth), async (req, res) => {
	let user = await User.findOne({ email: req.body.email });
	if (!user)
		return res.status(400).send(
			errorMessage({
				message: "Invalid email or password.",
				statausCode: 400,
			}),
		);

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword)
		return res.status(400).send(
			errorMessage({
				message: "Invalid email or password.",
				statausCode: 400,
			}),
		);

	// Create new JWT
	const token = user.generateAuthToken();

	res.send(
		success({
			message: "OK",
			results: {
				user: _.pick(user, ["_id", "name", "email"]),
				token,
			},
			statausCode: 200,
		}),
	);
});

function validateAuth(req) {
	const schema = Joi.object({
		email: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required(),
	});

	return schema.validate(req);
}

module.exports = router;

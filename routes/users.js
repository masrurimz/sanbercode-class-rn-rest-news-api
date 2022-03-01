const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

const { User, validate: userValidator } = require("../models/user");
const {
	error: errorMessage,
	success,
	validation,
} = require("../models/responseApi");

/**
 * @access Pirvate logged In user
 */
router.get("/me", auth, async (req, res) => {
	const user = await User.findById(req.user._id).select("-password");
	res.send(
		success({
			results: {
				user,
			},
		}),
	);
});

router.post("/", [validate(userValidator)], async (req, res) => {
	let user = await User.findOne({ email: req.body.email });
	if (user)
		return res.status(400).send(
			errorMessage({
				message: "User already registered.",
				statusCode: 400,
			}),
		);

	user = new User(_.pick(req.body, ["name", "email", "password"]));
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);

	await user.save();

	const token = user.generateAuthToken();

	res.header("Authorization", `Bearer ${token}`).send(
		success({
			results: {
				user: _.pick(user, ["_id", "name", "email"]),
				token,
			},
		}),
	);
});

module.exports = router;

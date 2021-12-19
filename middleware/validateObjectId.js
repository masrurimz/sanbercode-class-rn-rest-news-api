const mongoose = require("mongoose");
const { error: errorMessage } = require("../models/responseApi");

module.exports = function (req, res, next) {
	if (!mongoose.Types.ObjectId.isValid(req.params.id))
		return res.status(422).send(
			errorMessage({
				message: "Invalid object Id",
				statusCode: res.statusCode,
				results: {},
			}),
		);

	next();
};

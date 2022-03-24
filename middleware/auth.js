const jwt = require("jsonwebtoken");
const config = require("config");

const { error } = require("../models/responseApi");

module.exports = function auth(req, res, next) {
	const authHeader = req.header("Authorization");

	const token = authHeader?.substring(7);

	if (!token)
		return res.status(401).send(
			error({
				message: "Access denied. No token provided.",
				statusCode: 401,
				error: true,
			}),
		);

	try {
		const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
		req.user = decoded;
		next();
	} catch (ex) {
		res.status(401).send(
			error({
				message: "Access denied. Invalid token.",
				statusCode: 401,
			}),
		);
	}
};

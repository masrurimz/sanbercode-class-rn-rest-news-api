const express = require("express");

const {
	error: errorMessage,
	success,
	validation,
} = require("../models/responseApi");
const router = express.Router();

const { News, validate } = require("../models/news");

router.get("/", async (req, res) => {
	const news = await News.find();
	res.send(
		success({
			message: "OK",
			statusCode: res.statusCode,
			results: {
				news,
			},
		}),
	);
});

router.post("/", async (req, res) => {
	const { error } = validate(req.body);
	if (error)
		return res.status(400).send(
			errorMessage({
				message: error.details[0].message,
				statusCode: res.statusCode,
				results: {},
			}),
		);

	const news = new News({
		title: req.body.title,
		value: req.body.value,
	});
	await news.save();

	res.send(
		success({
			message: "OK",
			statusCode: res.statusCode,
			results: {
				news,
			},
		}),
	);
});

router.put("/:id", async (req, res) => {
	const { error } = validate(req.body);
	if (error)
		return res.status(400).send(
			errorMessage({
				message: error.details[0].message,
				statusCode: res.statusCode,
				results: {},
			}),
		);

	const news = await News.findByIdAndUpdate(
		req.params.id,
		{
			title: req.body.title,
			value: req.body.value,
		},
		{
			new: true,
		},
	);
	if (!news)
		return res.status(404).send(
			errorMessage({
				message: "The news with the given ID could not be found",
				statusCode: res.statusCode,
				results: {},
			}),
		);

	res.send(
		success({
			message: "OK",
			statusCode: res.statusCode,
			results: {
				news,
			},
		}),
	);
});

router.delete("/:id", async (req, res) => {
	const news = await News.findByIdAndRemove(req.params.id);

	if (!news)
		return res.status(404).send(
			errorMessage({
				message: "The news with the given ID could not be found",
				statusCode: res.statusCode,
				results: {},
			}),
		);

	res.send(
		success({
			message: "OK",
			statusCode: res.statusCode,
			results: {
				news,
			},
		}),
	);
});

module.exports = router;

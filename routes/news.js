const express = require("express");
const router = express.Router();

const { News, validate } = require("../models/news");

router.get("/", async (req, res) => {
	const news = await News.find();
	res.send(news);
});

router.post("/", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const news = new News({
		title: req.body.title,
		value: req.body.value,
	});
	await news.save();

	res.send(news);
});

router.put("/:id", async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

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
		return res
			.status(404)
			.send("The news with the given ID could not be found");

	res.send(news);
});

router.delete("/:id", async (req, res) => {
	const news = await News.findByIdAndRemove(req.params.id);

	if (!news)
		return res
			.status(404)
			.send("The news with the given ID could not be found");

	res.send(news);
});

module.exports = router;

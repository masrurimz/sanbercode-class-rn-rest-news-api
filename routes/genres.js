const express = require("express");
const router = express.Router();

const { Genre, validate: validateGenre } = require("../models/genre");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.send(genres);
});

/**
 * @access private
 */
router.post("/", [auth, validate(validateGenre)], async (req, res) => {
  const genre = new Genre({
    name: req.body.name,
  });
  await genre.save();

  res.send(genre);
});

router.put(
  "/:id",
  [validate(validateGenre), validateObjectId],
  async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      {
        new: true,
      }
    );
    if (!genre)
      return res
        .status(404)
        .send("The genre with the given ID could not be found");

    res.send(genre);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre)
    return res
      .status(404)
      .send("The genre with the given ID could not be found");

  res.send(genre);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre)
    return res
      .status(404)
      .send("The genre with the given ID could not be found");

  res.send(genre);
});

module.exports = router;

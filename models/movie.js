const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const genre = require("../models/genre");

const Movie = mongoose.model(
  "Movie",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 255,
    },
    genre: {
      type: genre.schema,
      required: true,
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
  })
);

const schema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  genreId: Joi.objectId().required(),
  numberInStock: Joi.number().min(0).max(255).required(),
  dailyRentalRate: Joi.number().min(0).max(255).required(),
});

function validateMovie(movie) {
  return schema.validate(movie);
}

exports.Movie = Movie;
exports.validate = validateMovie;

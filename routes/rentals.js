const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const { Rental, validate } = require("../models/rental");

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Start a sesssion to perform transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Check if customer ID sent correct
  const customer = await Customer.findById(req.body.customerId).session(
    session
  );
  if (!customer) res.status(400).send("Invalid customer ID...");

  // Check if customer ID sent correct
  const movie = await Movie.findById(req.body.movieId).session(session);
  if (!movie) return res.status(400).send("Invalid movie ID...");

  // Check movie stock
  if (movie.numberInStock === 0)
    return res.status(400).send("Movie not in stock.");

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });
  await rental.save({ session: session });

  movie.numberInStock--;
  await movie.save({ session: session });

  await session.commitTransaction();
  session.endSession();

  res.send(rental);
});

module.exports = router;

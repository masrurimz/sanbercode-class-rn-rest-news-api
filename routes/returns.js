const expess = require("express");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const moment = require("moment");
const mongoose = require("mongoose");
const router = expess.Router();

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Movie } = require("../models/movie");
const { Rental } = require("../models/rental");

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  const { customerId, movieId } = req.body;

  const rental = await Rental.lookup(customerId, movieId);
  if (!rental) return res.status(404).send("Rental not found");

  if (rental.dateReturned)
    return res.status(400).send("Return already processed");

  // Start a sesssion to perform transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  // Update rentals data
  rental.return();
  await rental.save({ session });

  // Increment movie stock
  await Movie.updateOne(
    { _id: rental.movie._id },
    { $inc: { numberInStock: 1 } },
    { session }
  );

  // Commit transactions
  await session.commitTransaction();
  session.endSession();

  return res.send(rental);
});

function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(req);
}

module.exports = router;

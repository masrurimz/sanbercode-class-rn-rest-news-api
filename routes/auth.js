const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const Joi = require("joi");
const router = express.Router();

const { User } = require("../models/user");
const validate = require("../middleware/validate");

router.post("/", validate(validateAuth), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const salt = await bcrypt.genSalt(10);
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  // Create new JWT
  const token = user.generateAuthToken();

  res.send(token);
});

function validateAuth(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = router;

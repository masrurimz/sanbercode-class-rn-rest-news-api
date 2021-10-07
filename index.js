const express = require("express");
const winston = require("winston");

const app = express();

require("./startup/logging")();
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);

require("./startup/routes")(app);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
	winston.info(`Listening on port ${port}`),
);

module.exports = server;

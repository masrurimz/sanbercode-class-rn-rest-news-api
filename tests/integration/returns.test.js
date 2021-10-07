const moment = require("moment");
const mongoose = require("mongoose");
const request = require("supertest");
const { Movie } = require("../../models/movie");

const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");

let server;

describe("/api/returns", () => {
  let customerId, movieId;
  let movie, rental;
  let token;

  beforeEach(async () => {
    server = require("../../index");

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();

    movie = new Movie({
      _id: movieId,
      title: "12345",
      dailyRentalRate: 2,
      genre: { name: "12345" },
      numberInStock: 10,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "12345",
      },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
      dateOut: moment().add(-7, "days").toDate(),
    });
    await rental.save();

    token = new User({ isAdmin: true }).generateAuthToken();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Movie.deleteMany({});
    await server.close();
  });

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({
        customerId,
        movieId,
      });
  };

  it("should work!", async () => {
    res = await Rental.findById(rental._id);

    expect(res).not.toBeNull();
  });

  // Return 401 if client not logged in
  // Return 400 if customerId is not provided
  // Return 400 if movieId is not provided
  // Return 404 if no rental found for this customerId & movieId
  // Return 400 if rental already processed
  // Return 200 if rental is valid request
  // Set the return date
  // Calculate the rental fee
  // Increase the stock
  // Return the rental object to client
  it("should return 401 if client not logged in", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if customerId is not provided", async () => {
    customerId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if movieId is not provided", async () => {
    movieId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental found for this customerId & movieId", async () => {
    await Rental.deleteMany({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it("should return 400 if rental already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if we have a valid request", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should return setted valid date", async () => {
    await exec();

    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set the rentalFee if input is valid", async () => {
    await exec();

    const rentalInDb = await Rental.findById(rental._id);
    const rentalDays = moment().diff(rentalInDb.dateOut, "days");

    expect(rentalInDb.rentalFee).toBe(
      rentalDays * rentalInDb.movie.dailyRentalRate
    );
  });

  it("should increase the movie stock if input is valid", async () => {
    await exec();

    const movieinDb = await Movie.findById(movieId);

    expect(movieinDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental if input is valid", async () => {
    const res = await exec();

    const rentalInDb = await Rental.findById(rental._id);

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "rentalFee",
        "customer",
        "movie",
      ])
    );
  });
});

const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const monggoose = require("mongoose");

let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Genre.deleteMany({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);

      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return genre if valid id is passed", async () => {
      const genre = new Genre({
        name: "genre1",
      });
      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 422 if invalid id is passed", async () => {
      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(422);
    });

    it("should return 404 if no genre with the given id exist", async () => {
      const id = monggoose.Types.ObjectId();
      const res = await request(server).get("/api/genres/" + id);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const exec = () => {
      return request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await exec();

      const genre = await Genre.find({ name: "genre1" });
      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    let id;
    let name;
    let genre;

    const exec = () => {
      return request(server)
        .put("/api/genres/" + id)
        .send({ name });
    };

    beforeEach(async () => {
      name = "genre2";
      id = monggoose.Types.ObjectId().toHexString();

      genre = new Genre({
        _id: id,
        name: "genre1",
      });
      await genre.save();
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 422 if the given id is invalid", async () => {
      id = "a";
      const res = await exec();

      expect(res.status).toBe(422);
    });

    it("should return 404 if the given id could not be found", async () => {
      id = monggoose.Types.ObjectId().toHexString();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 200 if the given id and name is valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return genre if the id and name is valid", async () => {
      const res = await exec();

      expect(res.body).toMatchObject({ _id: id, name });
    });
  });

  describe("DELETE /:id", () => {
    let id;
    let token;
    let genre;

    const exec = () => {
      return request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token);
    };

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();

      id = monggoose.Types.ObjectId().toHexString();
      genre = { _id: id, name: "genre1" };
      await Genre.create(genre);
    });

    it("should return 401 if user not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if user not an admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 422 if id is invalid", async () => {
      id = "a";

      const res = await exec();

      expect(res.status).toBe(422);
    });

    it("should return 404 if id valid and genre with the given id not found", async () => {
      id = monggoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 200 if id valid and founded genre with the given id", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should return deleted genre if it is valid", async () => {
      const res = await exec();

      expect(res.body).toMatchObject(genre);
    });
  });
});

const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const app = require("../index");
const jwt = require("jsonwebtoken");
require("dotenv").config();
let mongoServer;
let server;

const tokenSecret = process.env.ACCESS_TOKEN_SECRET;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.disconnect();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  server = app.listen(0);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();

  if (server) {
    server.close();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe("Auth Service Tests", () => {
  let sampleUser = {
    username: "JohnSmith",
    password: "password123",
    email: "johnsmith@example.com",
    firstName: "John",
    lastName: "Smith",
  };

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/auth/registerUser")
        .send(sampleUser);

      expect(res.status).toBe(201);
      expect(res.body.newUser.username).toBe(sampleUser.username);
    });

    it("should return 500 if registration fails", async () => {
      jest.spyOn(User, "create").mockRejectedValueOnce(new Error("DB Error"));

      const res = await request(app)
        .post("/auth/registerUser")
        .send(sampleUser);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({});
    });
  });

  describe("POST /login", () => {
    const userCredentials = {
      email: "johnsmith@example.com",
      password: "password123",
    };

    it("should login an existing user", async () => {
      await request(app).post("/auth/registerUser").send({
        username: "JohnSmith",
        password: "password123",
        email: "johnsmith@example.com",
        firstName: "John",
        lastName: "Smith",
      });

      const res = await request(app)
        .post("/auth/loginUser")
        .send(userCredentials);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("posts");
    });
  });
});

describe("GET /profile", () => {
  let validToken;
  let invalidToken;

  beforeAll(() => {
    validToken = jwt.sign(
      { id: "valid-user-id", username: "john_doe" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    invalidToken = "invalid-jwt-token";
  });

  it("should return 401 if authorization header is missing", async () => {
    jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });
    const res = await request(app).get("/auth/getProfile");

    expect(res.status).toBe(401);
    expect(res._body.message).toBe("Authorization header is missing");
  });

  it("should return 201 if a user is found", async () => {
    await request(app).post("/auth/registerUser").send({
      id: "valid-user-id",
      username: "john_doe",
      password: "password123",
      email: "johnsmith@example.com",
      firstName: "John",
      lastName: "Smith",
    });

    const res = await request(app)
      .get("/auth/getProfile")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(201);
  });
});

const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const app = require("../index");
const { accessToken } = require("../JWT/jwt-helpers");

let mongoServer;
let server;

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
      expect(res.body).toHaveProperty("token");
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
      expect(res.body).toHaveProperty("token");
    });
  });
});

jest.mock("../JWT/jwt-helpers", () => ({
  accessToken: jest.fn(),
}));

describe("GET /profile", () => {
  let validToken;

  beforeEach(() => {
    validToken = "valid-jwt-token";
  });

  it("should return 401 if authorization header is missing", async () => {
    const res = await request(app).get("auth/getProfile");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Authorization header is missing");
  });

  it("should return 401 if token is missing", async () => {
    const res = await request(app)
      .get("/auth/getProfile")
      .set("Authorization", "Bearer");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token is missing");
  });

  it("should return 401 if the token is invalid", async () => {
    accessToken.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    const res = await request(app)
      .get("/auth/getProfile")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid token");
  });

  it("should return 404 if user is not found", async () => {
    accessToken.mockImplementationOnce(() => ({
      id: "non-existent-user-id",
      username: "non-existsing-name",
    }));

    User.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Something went wrong");
  });

  it("should return 200 and user profile when valid token is provided", async () => {
    const mockUser = {
      id: "user-id",
      username: "john_doe",
      email: "john.doe@example.com",
    };

    accessToken.mockImplementationOnce(() => ({
      id: "user-id",
      username: "john_doe",
    }));

    User.findOne = jest.fn().mockResolvedValue(mockUser);

    const res = await request(app)
      .get("/profile")
      .set("Authorization", `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Profile for user with Id user-id:");
    expect(res.body.foundUser).toEqual(mockUser);
  });
});

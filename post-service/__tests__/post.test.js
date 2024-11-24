const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");
const jwt = require("jsonwebtoken");
require("dotenv").config();
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

describe("Post Service Tests", () => {
  let sampleUser = {
    username: "JohnSmith",
    password: "password123",
    email: "johnsmith@example.com",
    firstName: "John",
    lastName: "Smith",
  };

  describe("POST /createPost", () => {
    beforeAll(() => {
      validToken = jwt.sign(
        { id: "valid-user-id", username: sampleUser.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      invalidToken = "invalid-jwt-token";
    });
    it("should create a new post", async () => {
      await request(app).post("/auth/registerUser").send({
        id: "valid-user-id",
        username: sampleUser.username,
        password: "password123",
        email: "johnsmith@example.com",
        firstName: "John",
        lastName: "Smith",
      });

      const postData = {
        title: "Sample Post Title",
        content: "This is the content of the post",
      };

      const res = await request(app)
        .post("/post/createPost")
        .set("Authorization", `Bearer ${validToken}`)
        .send(postData);

      expect(res.status).toBe(201);
    });
  });
});

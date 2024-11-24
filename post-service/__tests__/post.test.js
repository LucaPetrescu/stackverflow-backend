const mongoose = require("mongoose");
const request = require("supertest");
const User = require("../models/User");
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

  let samplePost = {
    userId: "sample-user-id",
    title: "Sample Post",
    content: "This is a sample post.",
  };

  describe("POST /createPost", () => {});
});

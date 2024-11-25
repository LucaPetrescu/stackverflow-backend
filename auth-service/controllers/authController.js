const axios = require("axios");
const User = require("../models/User");
const Post = require("../models/Post");

const {
  encryptPassword,
  checkPassword,
} = require("../password-helpers/password-helpers");

const {
  accessToken,
  refreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} = require("../JWT/jwt-helpers");

const days = 225892000;

exports.sayHello = async (req, res) => {
  res.send("Hello from this app");
};

exports.registerUser = async (req, res) => {
  try {
    const {
      username,
      password: plainTextPassword,
      email,
      lastName,
      firstName,
    } = req.body;

    const hashedPassword = encryptPassword(plainTextPassword);

    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });

    const token = accessToken(newUser._id, newUser.username);

    res.cookie("access-token", token, {
      expires: new Date(Date.now() + days),
      httpOnly: true,
    });

    //I know the access token is already being setted as an http-only cookie,
    // but since this is a demo app, it will be much easier for me to handle it like this

    res.status(201).send({ token, newUser });
  } catch (e) {
    res.status(500).send(e.message);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      res.status(404).send({ message: "User not found" });
    }

    if (!checkPassword(password, foundUser.password)) {
      res.status(404).send({ message: "Incorrect email or password" });
    }

    const token = accessToken(foundUser.id, foundUser.username);

    // res.cookie("access-token", token, {
    //   expires: new Date(Date.now() + days),
    //   httpOnly: true,
    // });

    const posts = await Post.find();

    //I know the access token is already being is already being setted as an http-only cookie,
    // but since this is a demo app, it will be much easier for me to handle it like this

    return res.status(200).send({ token: token, posts });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Registration failed: ", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res
        .status(401)
        .send({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send({ message: "Token is missing" });
    }

    const userFromToken = accessToken(token);

    const userid = userFromToken.id;

    const foundUser = await User.findOne(userid);

    if (!foundUser) {
      res.status(404).send({ message: "Something went wrong" });
    }

    return res
      .status(201)
      .send({ message: `Profile for user with Id ${userid}:`, foundUser });
  } catch (err) {
    res.status(500).send(err);
  }
};

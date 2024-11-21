const mongoose = require("mongoose");
const User = require("../model/user");

const {
  encryptPassword,
  checkPassword,
} = require("../password-helpers/password-helpers");

const {
  accessToken,
  refreshToken,
  accessToken,
} = require("../JWT/jwt-helpers");

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

    const accessToken = accessToken(newUser.id, newUser.username);

    res.status(201).send({ accessToken });
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body();
    const foundUser = await User.findOne({ email });
  } catch (e) {}
};

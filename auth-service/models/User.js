const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: "string", require: true, unique: true },
    email: { type: "string", require: true, unique: true },
    password: { type: "string", require: true },
    firstName: { type: "string" },
    lastName: { type: "string" },
  },
  {
    collection: "users",
  }
);

const model = mongoose.model("UserSchema", UserSchema);

module.exports = model;

const bcrypt = require("bcrypt");

function encryptPassword(plainTextPassword) {
  return bcrypt.hashSync(plainTextPassword, 10);
}

function checkPassword(password, userPassword) {
  return bcrypt.compareSync(password, userPassword);
}

module.exports = { encryptPassword, checkPassword };

const jwt = require("jsonwebtoken");

const accessOptions = {
  expiresIn: "10m",
};

const refreshOptions = {
  expiresIn: "3h",
};

const accessToken = (id, username) => {
  return jwt.sign(
    { id, username },
    process.env.ACCESS_TOKEN_SECRET,
    accessOptions
  );
};

const refreshToken = (id, username) => {
  return jwt.sign(
    { id, username },
    process.env.REFRESH_TOKEN_SECRET,
    refreshOptions
  );
};

function verifyRefreshToken(refreshToken) {
  const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  return user;
}

function verifyAccessToken(accessToken) {
  const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  return user;
}

module.exports = {
  accessToken,
  refreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};

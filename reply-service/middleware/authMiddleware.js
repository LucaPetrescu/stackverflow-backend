const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    const secretKey = process.env.ACCESS_TOKEN_SECRET;

    const user = jwt.verify(token, secretKey);

    req.user = { id: user.id };
    next();
  } catch (err) {
    console.error("Error in token authentication middleware:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authenticateToken;

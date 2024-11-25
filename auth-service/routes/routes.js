const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/registerUser", authController.registerUser);
router.post("/loginUser", authController.loginUser);
router.get("/getProfile", authController.getProfile);
router.get("/sayHello", authController.sayHello);

module.exports = router;

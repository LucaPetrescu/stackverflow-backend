const express = require("express");
const router = express.Router();
const topkpostsController = require("../controllers/topkpostsController");

router.get("/getTopKPosts", topkpostsController.getTopKPosts);

module.exports = router;

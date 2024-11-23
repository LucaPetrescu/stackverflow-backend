const express = require("express");
const mongoose = require("mongoose");
const db = require("./db/mongodb").MongoURI;
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 7003;

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log("Mongoose Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/topkPosts", routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const mongoose = require("mongoose");
const db = require("./db/mongodb").MongoURI;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const routes = require("./routes/routes");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7002;

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

app.use("/reply", routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

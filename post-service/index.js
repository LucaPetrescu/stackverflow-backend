const express = require("express");
const mongoose = require("mongoose");
// const Redis = require("ioredis");
const db = require("./db/mongodb").MongoURI;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const routes = require("./routes/routes");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7001;

// const redis = new Redis({
//   host: "stackoverflow-redis",
//   port: 6379,
//   password: null,
// });

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

app.use("/post", routes);

// app.get("/setredis", async (req, res) => {
//   const { key, value } = req.query;

//   if (!key || !value) {
//     return res
//       .status(400)
//       .send('Please provide both "key" and "value" query parameters.');
//   }

//   try {
//     await redis.set(key, value);
//     console.log(`Key "${key}" set with value "${value}".`);

//     const retrievedValue = await redis.get(key);

//     if (retrievedValue) {
//       return res
//         .status(200)
//         .send(
//           `Key "${key}" was successfully set with value: "${retrievedValue}".`
//         );
//     } else {
//       return res.status(404).send(`Key "${key}" not found in Redis.`);
//     }
//   } catch (error) {
//     console.error("Error interacting with Redis:", error);
//     return res
//       .status(500)
//       .send("An error occurred while interacting with Redis.");
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

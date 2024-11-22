const express = require("express");
const mongoose = require("mongoose");
const db = require("./db/mongodb").MongoURI;
const bodyParser = require("body-parser");
const morgan = require("morgan");

require("dotenv").config();

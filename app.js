var express = require("express");
var app = express();
const cors = require("cors");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));
var controller = require("./apps/controllers");
app.use(controller);

var server = app.listen(3000, function () {
  console.log("Server is running on port 3000");
});

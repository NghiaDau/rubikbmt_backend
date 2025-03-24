var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var controller = require("./apps/controllers");
app.use(controller);

var server = app.listen(3000, function () {
  console.log("Server is running on port 3000");
});

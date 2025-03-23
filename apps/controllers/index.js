var express = require("express");
var router = express.Router();
router.use("/home", function (req, res) {
  res.json({ message: "Welcome to the home page!" });
});
router.use("/api/v1/auth", require("./api/authController"));
module.exports = router;

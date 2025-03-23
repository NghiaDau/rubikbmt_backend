var express = require("express");
var router = express.Router();
var User = require("./../../entities/user");
var AuthService = require("./../../services/authService");

router.post("/login", async function (req, res) {
  return res.json({
    message: "Login successful",
  });
});

router.post("/register", async function (req, res) {
  var { username, password } = req.body;
  var user = new User();
  user.username = username;
  user.password = password;
  var authService = new AuthService();
  var result = await authService.register(user);
  res.json({
    message: "User registered successfully",
    user: result,
  });
});
module.exports = router;

var express = require("express");
var router = express.Router();
router.use("/home", function (req, res) {
  res.json({ message: "Welcome to the home page!" });
});
router.use("/api/v1/auth", require("./api/authController"));
router.use("/api/v1/role", require("./api/roleController"));
router.use("/api/v1/claim", require("./api/claimControler"));
router.use("/api/v1/user-role", require("./api/userRoleControler"));
module.exports = router;

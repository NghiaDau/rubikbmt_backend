var express = require("express");
var router = express.Router();
router.use("/home", function (req, res) {
  res.json({ message: "Welcome to the home page!" });
});
router.use("/api/v1/auth", require("./api/authController"));
router.use("/api/v1/role", require("./api/roleController"));
router.use("/api/v1/claim", require("./api/claimControler"));
router.use("/api/v1/user-role", require("./api/userRoleControler"));

router.use("/api/v1/course", require("./api/courseController"));
router.use("/api/v1/cubeSubject", require("./api/cubeSubjectController"));
router.use("/api/v1/level", require("./api/levelController"));
router.use("/api/v1/cubeSkill", require("./api/cubeSkillController"));
router.use("/api/v1/courseDetail", require("./api/courseDetailController"));
router.use("/api/v1/session", require("./api/sessionController"));
module.exports = router;

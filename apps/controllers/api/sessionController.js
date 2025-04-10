var express = require("express");
var router = express.Router();
var Session = require("./../../entities/session");
var SessionService = require("./../../services/sessionService");
var verifyToken = require("./../../utils/verifyToken");
var validateObjectId = require("./../../utils/validateObjectId");


router.post("/add", verifyToken, async function (req, res) {
  try {
    var { name, description, cubeId, status } = req.body;
    var sessionService = new SessionService();
    var session = new Session();
    session.name = name;
    session.description = description;
    session.cubeId = cubeId;
    session.status = status;
    var result = await sessionService.insertSession(session);
    return res.status(200).json({
      status: true,
      message: "Session added successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/getAll", verifyToken, async function (req, res) {
  try {
    var sessionService = new SessionService();
    var result = await sessionService.getAllSession();
    return res.status(200).json({
      status: true,
      message: "Get all sessions successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/getById/:id", verifyToken, async function (req, res) {
  try {
    const id = req.params.id;
    if (!validateObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid ID format",
      });
    }
    var sessionService = new SessionService();
    var result = await sessionService.getSessionById(id);
    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Session not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Get session successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});
router.get("/getByCourseDetail/:id")
router.put("/update/:id", verifyToken, async function (req, res) {
  try {
    const id = req.params.id;
    if (!validateObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid ID format",
      });
    }
    var { name, description, cubeId, status } = req.body;
    var sessionService = new SessionService();
    var session = new Session();
    session._id = id;
    session.name = name;
    session.description = description;
    session.cubeId = cubeId;
    session.status = status;
    var result = await sessionService.updateSession(session);
    return res.status(200).json({
      status: true,
      message: "Session updated successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});
router.delete("/delete/:id", verifyToken, async function (req, res) {
  try {
    const id = req.params.id;
    if (!validateObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid ID format",
      });
    }
    var sessionService = new SessionService();
    var result = await sessionService.deleteSession(id);
    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Session not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;

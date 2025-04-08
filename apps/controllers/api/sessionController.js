var express = require("express");
var router = express.Router();
var Session = require("./../../entities/session");
var SessionService = require("./../../services/sessionService");
var verifyToken = require("./../../utils/verifyToken");

router.post("/add", verifyToken, async function (req, res) {
  try {
    var { name, startTime, endTime, idcourseDetail } = req.body;
    var sessionService = new SessionService();
    var session = new Session(name, startTime, endTime, idcourseDetail);
    var result = await sessionService.addSession(session);
    return res.status(201).json({
      status: true,
      message: "Thêm session thành công",
      data: { session: result },
    });
  } catch (error) {
    console.error("Lỗi ở /add:", error);
    return res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message,
    });
  }
});

router.get("/get-list", verifyToken, async function (req, res) {
  try {
    var sessionService = new SessionService();
    var result = await sessionService.getListSession();
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy session",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Lấy danh sách session thành công",
      data: { sessions: result },
    });
  } catch (error) {
    console.error("Lỗi ở /get-list:", error);
    return res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message,
    });
  }
});

router.get("/get-by-course-detail-id", verifyToken, async function (req, res) {
  try {
    var sessionService = new SessionService();

    var result = await sessionService.getSessionByCourseDetailId(req.query.id);
    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy session",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Lấy danh sách session thành công",
      data: { sessions: result },
    });
  } catch (error) {
    console.error("Lỗi ở /get-by-course-detail-id:", error);
    return res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message,
    });
  }
});

router.get("/get", verifyToken, async function (req, res) {
  try {
    var sessionService = new SessionService();
    var result = await sessionService.getSessionById(req.query.id);
    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy session",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Lấy session thành công",
      data: { session: result },
    });
  } catch (error) {
    console.error("Lỗi ở /get:", error);
    return res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message,
    });
  }
});

router.patch("/update", verifyToken, async function (req, res) {
  try {
    var { _id, startTime, endTime, idCourseDetail, content, ao5 } = req.body;
    console.log("req.body:", req.body);
    var sessionService = new SessionService();
    var existingSession = await sessionService.getSessionById(_id);
    if (!existingSession) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy session",
      });
    }
    var session = {
      startTime: startTime || existingSession.startTime,
      endTime: endTime || existingSession.endTime,
      idCourseDetail: idCourseDetail || existingSession.idCourseDetail,
      content: content || existingSession.content,
      ao5: ao5 || existingSession.ao5,
    };
    session._id = _id;
    console.log("session:", session);
    var result = await sessionService.updateSession(session);
    return res.status(200).json({
      status: true,
      message: "Cập nhật session thành công",
      data: { session: result },
    });
  } catch (error) {
    console.error("Lỗi ở /update:", error);
    return res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message,
    });
  }
});

router.delete("/delete", verifyToken, async function (req, res) {
  try {
    var sessionService = new SessionService();
    var result = await sessionService.deleteSession(req.query.id);
    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy session",
      });
    }
    return res.status(200).json({
      status: true,
      message: "Xóa session thành công",
      data: { session: result },
    });
  } catch (error) {
    console.error("Lỗi ở /delete:", error);
    return res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message,
    });
  }
});

module.exports = router;

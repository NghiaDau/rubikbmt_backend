var express = require("express");
var router = express.Router();
var Course = require("./../../entities/course");
var CourseService = require("./../../services/courseService");
var validateCourse = require("./../../utils/validateCourse");
var validateObjectId = require("./../../utils/validateObjectId");
var verifyToken = require("./../../utils/verifyToken");
//  API: Thêm Course
router.post("/add", verifyToken, validateCourse, async function (req, res) {
  try {
    var {
      name, description, requirement, target,
      min_age, max_age, minutesPerSesion, NumOfSession,
      fee, idCubeSubject, idLevel
    } = req.body;

    var course = {
      name, description, requirements: requirement, target,
      min_age, max_age, minutesPerSession: minutesPerSesion,
      numOfSessions: NumOfSession, fee,
      cubeSubject: idCubeSubject, level: idLevel
    };

    var courseService = new CourseService();
    var result = await courseService.addCourse(course);

    res.status(201).json({
      status: true,
      message: "Khóa học được thêm thành công",
      data:
        { course: result },

    });
  } catch (error) {
    console.error("Lỗi ở /add:", error);
    res.status(500).json({ status: false, message: "Xảy ra lỗi trên Server", error: error.message });
  }
});

//  API: Lấy danh sách Courses
router.get("/get-list", verifyToken, async function (req, res) {
  try {
    var courseService = new CourseService();
    var result = await courseService.getCourses();

    res.status(200).json({
      status: true,
      message: "Lấy danh sách khóa học thành công",
      data: { courses: result },
    });
  } catch (error) {
    console.error("Lỗi ở /get-list:", error);
    res.status(500).json({ status: false, message: "Xảy ra lỗi trên Server", error: error.message });
  }
});

//  API: Lấy thông tin chi tiết Course theo ID
router.get("/get", verifyToken, validateObjectId, async function (req, res) {
  try {
    var courseService = new CourseService();
    var { id } = req.query;

    var result = await courseService.getCourseById(id);

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy khóa học",
      });
    }

    res.status(200).json({
      status: true,
      message: "Lấy khoá học thành công",
      data: { course: result },
    });
  } catch (error) {
    console.error("Lỗi ở /get-course:", error);
    res.status(500).json({ status: false, message: "Xảy ra lỗi trên Server", error: error.message });
  }
});

router.get("/search", verifyToken, async function (req, res) {
  try {
    let { search = "", page = 1, limit = 10 } = req.query;

    // Chuyển đổi kiểu dữ liệu
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    var courseService = new CourseService();
    var result = await courseService.searchCourses(search, skip, limit);

    res.json({
      status: true,
      message: "Lấy danh sách khóa học thành công",
      data: {
        courses: result,
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tìm khóa học:", error);
    res.status(500).json({ status: false, message: "Xảy ra lỗi trên Server" });
  }
});
module.exports = router;

var express = require("express");
var router = express.Router();
var CourseDetail = require("./../../entities/coursedetail");
var CourseDetailService = require("./../../services/courseDetailService");
var validateCourseDetail = require("./../../utils/validateCourseDetail");
var verifyToken = require("./../../utils/verifyToken");
var validateObjectId = require("./../../utils/validateObjectId");
// /api/v1/courseDetail

// API: Thêm CourseDetail
router.post("/add", verifyToken, validateCourseDetail, async function (req, res) {
  try {
    var { actualFee, Paid, numberOfStudied, course, student, teacher, sessions } = req.body;

    var courseDetail = {
      actualFee, Paid, numberOfStudied, course, student, teacher
    };

    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.addCourseDetail(courseDetail, sessions);

    res.status(201).json({
      status: true,
      message: "Thêm chi tiết khóa học thành công",
      data: [
        { courseDetail: result },
      ],
    });
  } catch (error) {
    console.error("Lỗi ở /add:", error);
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message
    });
  }
});

// API: Lấy danh sách CourseDetail
router.get("/get-list", verifyToken, async function (req, res) {
  try {
    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.getCourseDetails();
    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy chi tiết khóa học"
      });
    }
    res.status(200).json({
      status: true,
      message: "Lấy danh sách chi tiết khóa học thành công",
      data: [{ courseDetails: result }],
    });
  } catch (error) {
    console.error("Lỗi ở /get-list:", error);
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message
    });
  }
});

// API: Lấy thông tin chi tiết CourseDetail theo ID
router.get("/get", verifyToken, validateObjectId, async function (req, res) {
  try {
    var { id } = req.query;
    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.getCourseDetailById(id);

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Course Detail not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Lấy chi tiết khóa học thành công",
      data: [{ courseDetail: result }],
    });
  } catch (error) {
    console.error("Lỗi ở /get-course-detail:", error);
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message
    });
  }
});

//  API: Cập nhật CourseDetail
router.put("/update", verifyToken, validateObjectId, async function (req, res) {
  try {
    var { _id } = req.query;
    var { actualFee, Paid, numberOfStudied, course, student, teacher, evaluation, session } = req.body;

    var courseDetail = {
      _id, actualFee, Paid, numberOfStudied, course, student, teacher, evaluation, session
    };

    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.updateCourseDetail(courseDetail);

    res.status(200).json({
      status: true,
      message: "Cập nhật chi tiết khóa học thành công",
      data: [
        { courseDetail: result },
      ],
    });
  } catch (error) {
    console.error("Lỗi ở /update:", error);
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message
    });
  }
});

//  API: Đánh giá CourseDetail
router.post("/evaluation", verifyToken, validateObjectId, async function (req, res) {
  try {
    var { id } = req.query;
    var { evaluations } = req.body;

    if (!Array.isArray(evaluations)) {
      return res.status(400).json({
        status: false,
        message: "Dữ liệu đánh giá không hợp lệ"
      });
    }

    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.evaluateCourseDetail(id, evaluations);

    res.status(200).json({
      status: true,
      message: "Đánh giá kỹ năng thành công",
      data: [
        { courseDetail: result },
      ],
    });
  } catch (error) {
    console.error("Lỗi ở /evaluation:", error);
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
      error: error.message
    });
  }
});
router.get("/search", verifyToken, async function (req, res) {
  try {
    let { search = "", page = 1, limit = 10 } = req.query;

    // Chuyển đổi kiểu dữ liệu
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.search(search, skip, limit);
    var totalCount = await courseDetailService.countCourseDetail(search);

    res.json({
      status: true,
      message: "Lấy chi tiết khóa học thành công",
      data: [
        { currentPage: page },
        { limit: limit },
        { totalItems: totalCount },
        { totalPages: Math.ceil(totalCount / limit) },
        { levels: result }
      ],
    });
  } catch (error) {
    console.error("Xảy ra lỗi khi tìm kiếm chi tiết khóa học:", error);
    res.status(500).json({ 
      status:false,
      message: "Xảy ra lỗi trên Server" });
  }
});
module.exports = router;

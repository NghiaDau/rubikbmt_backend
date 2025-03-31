var express = require("express");
var router = express.Router();
var CourseDetail = require("./../../entities/coursedetail");
var CourseDetailService = require("./../../services/courseDetailService");
var validateCourseDetail = require("./../../utils/validateCourseDetail");
// /api/v1/courseDetail

// 🟢 API: Thêm CourseDetail
router.post("/add", validateCourseDetail, async function (req, res) {
  try {
    var { actualFee, Paid, numberOfStudied, course, student, teacher, sessions } = req.body;

    var courseDetail = {
      actualFee, Paid, numberOfStudied, course, student, teacher
    };

    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.addCourseDetail(courseDetail, sessions);

    res.status(201).json({
      message: "Course Detail added successfully",
      courseDetail: result,
    });
  } catch (error) {
    console.error("❌ Error in /add:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// 🟢 API: Lấy thông tin chi tiết CourseDetail theo ID
router.get("/get-course-detail", async function (req, res) {
  try {
    var { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Missing courseDetail ID" });
    }

    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.getCourseDetailById(id);

    if (!result) {
      return res.status(404).json({
        message: "Course Detail not found",
      });
    }

    res.status(200).json({
      message: "Course Detail fetched successfully",
      courseDetail: result,
    });
  } catch (error) {
    console.error("❌ Error in /get-course-detail:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// 🟢 API: Cập nhật CourseDetail
router.put("/update", async function (req, res) {
  try {
    var { _id } = req.query;
    var { actualFee, Paid, numberOfStudied, course, student, teacher, evaluation, session } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Missing _id for update" });
    }

    var courseDetail = {
      _id, actualFee, Paid, numberOfStudied, course, student, teacher, evaluation, session
    };

    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.updateCourseDetail(courseDetail);

    res.status(200).json({
      message: "Course Detail updated successfully",
      courseDetail: result,
    });
  } catch (error) {
    console.error("❌ Error in /update:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// 🟢 API: Đánh giá CourseDetail
router.post("/evaluation", async function (req, res) {
  try {
    var { id } = req.query;
    var { evaluations } = req.body;

    if (!id || !Array.isArray(evaluations)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.evaluateCourseDetail(id, evaluations);

    res.status(200).json({
      message: "Course Detail evaluated successfully",
      courseDetail: result,
    });
  } catch (error) {
    console.error("❌ Error in /evaluation:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
router.get("/search", async function (req, res) {
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
      message: "Course detail fetched successfully",
      currentPage: page,
      limit: limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      levels: result,
    });
  } catch (error) {
    console.error("Error searching Course detail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;

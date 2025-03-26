var express = require("express");
var router = express.Router();
var CourseDetail = require("./../../entities/coursedetail");
var CourseDetailService = require("./../../services/courseDetailService");
// /api/v1/courseDetail/add
router.post("/add", async function (req, res) {
  var { actualFee, Paid, numberOfStudied, course, student, teacher, sessions } =
    req.body;
  var courseDetail = new CourseDetail();
  courseDetail.actualFee = actualFee;
  courseDetail.Paid = Paid;
  courseDetail.numberOfStudied = numberOfStudied;
  courseDetail.course = course;
  courseDetail.student = student;
  courseDetail.teacher = teacher;
  var courseDetailService = new CourseDetailService();
  var result = await courseDetailService.addCourseDetail(
    courseDetail,
    sessions
  );
  res.json({
    message: "Course Detail added successfully",
    courseDetail: result,
  });
});
router.get("/get-course-detail", async function (req, res) {
  var courseDetailService = new CourseDetailService();
  var result = await courseDetailService.getCourseDetailById(req.query.id);
  if (!result) {
    return res.status(404).json({
      message: "Course Detail not found",
    });
  }
  res.json({
    message: "Course Detail fetched successfully",
    courseDetail: result,
  });
});
router.put("/update", async function (req, res) {
  var {
    _id,
    actualFee,
    Paid,
    numberOfStudied,
    course,
    student,
    teacher,
    evaluation,
    session,
  } = req.body;
  var courseDetail = new CourseDetail();
  courseDetail._id = _id;
  courseDetail.actualFee = actualFee;
  courseDetail.Paid = Paid;
  courseDetail.numberOfStudied = numberOfStudied;
  courseDetail.course = course;
  courseDetail.student = student;
  courseDetail.teacher = teacher;
  courseDetail.evaluation = evaluation;
  courseDetail.session = session;
  var courseDetailService = new CourseDetailService();
  var result = await courseDetailService.updateCourseDetail(courseDetail);
  res.json({
    message: "Course Detail updated successfully",
    courseDetail: result,
  });
});
module.exports = router;

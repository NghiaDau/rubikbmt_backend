var express = require("express");
var router = express.Router();
var Course = require("./../../entities/course");
var CubeSubject = require("./../../entities/cubesubject");
var CourseService = require("./../../services/courseService");
var LevelService = require("./../../services/levelService");
var CubeSubjectService = require("./../../services/cubeSubjectService");
var validateCourse = require("./../../utils/validateCourse");
var validateObjectId = require("./../../utils/validateObjectId");
router.post("/add", validateCourse, async function (req, res) {
  var {
    name,
    description,
    requirement,
    target,
    min_age,
    max_age,
    minutesPerSesion,
    NumOfSession,
    fee,
    idCubeSubject,
    idLevel,
  } = req.body;
  var course = new Course();
  course.name = name;
  course.description = description;
  course.requirements = requirement;
  course.target = target;
  course.min_age = min_age;
  course.max_age = max_age;
  course.minutesPerSession = minutesPerSesion;
  course.numOfSessions = NumOfSession;
  course.fee = fee;
  course.cubeSubject = idCubeSubject;
  course.level = idLevel;
  var courseService = new CourseService();
  var result = await courseService.addCourse(course);
  res.json({
    message: "Course added successfully",
    course: result,
  });
});
router.get("/get-list", async function (req, res) {
  var courseService = new CourseService();
  var result = await courseService.getCourses();
  res.json({
    message: "Courses fetched successfully",
    courses: result,
  });
});
router.get("/get-course", validateObjectId, async function (req, res) {
  var courseService = new CourseService();
  var result = await courseService.getCourseById(req.query.id);
  if (!result) {
    return res.status(404).json({
      message: "Course not found",
    });
  }
  res.json({
    message: "Course fetched successfully",
    course: result,
  });
});
module.exports = router;

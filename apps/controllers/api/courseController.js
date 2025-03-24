var express = require("express");
var router = express.Router();
var Course = require("./../../entities/course");
var CourseService = require("./../../services/courseService");
var LevelService = require("./../../services/levelService");
var CubeSubjectService = require("./../../services/cubeSubjectService");
router.post("/addCourse", async function (req, res) {
    var { name, description, requirement, target, min_age, max_age, minutesPerSesion, NumOfSession, fee, idCubeSubject, idLevel } = req.body;
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
    course.idCubeSubject = idCubeSubject;
    course.idLevel = idLevel;
    var courseService = new CourseService();
    var result = await courseService.addCourse(course);
    res.json({
        message: "Course added successfully",
        course: result,
    });
});
router.get("/getCourses", async function (req, res) {
    var courseService = new CourseService();
    var result = await courseService.getCourses();
    res.json({
        message: "Courses fetched successfully",
        courses: result,
    });
});
router.get("/getCourseById", async function (req, res) {
    console.log(req.query.id);
    var courseService = new CourseService();
    var result = await courseService.getCourseById(req.query.id);
    var levelService = new LevelService();
    var level = await levelService.getLevelById(result.idLevel);
    var cubeSubjectService = new CubeSubjectService();
    var cubeSubject = await cubeSubjectService.getCubeSubjectById(result.idCubeSubject);
    result.level_name = level.name;
    result.cubeSubject_name = cubeSubject.name;
    res.json({
        message: "Course fetched successfully",
        course: result,
    });
});
module.exports = router;
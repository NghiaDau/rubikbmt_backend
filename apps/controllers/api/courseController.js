var express = require("express");
var router = express.Router();
var Course = require("./../../entities/course");
var CourseService = require("./../../services/courseService");
var LevelService = require("./../../services/levelService");
var CubeSubjectService = require("./../../services/cubeSubjectService");
var validateCourse = require("./../../utils/validateCourse"); 
var validateObjectId = require("./../../utils/validateObjectId"); 
router.post("/addCourse", validateCourse,async function (req, res) {
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
router.get("/getCourseById", validateObjectId, async function (req, res) {
    var courseService = new CourseService();
    var result = await courseService.getCourseById(req.query.id);
    if(!result) {
        return res.status(404).json({
            message: "Course not found",
        });
    }
    // var levelService = new LevelService();
    // var cubeSubjectService = new CubeSubjectService();
    // const [level, cubeSubject] = await Promise.all([
    //     levelService.getLevelById(result.idLevel),
    //     cubeSubjectService.getCubeSubjectById(result.idCubeSubject),
    // ]);
    // result.level_name = level.name;
    // result.cubeSubject_name = cubeSubject.name;
    res.json({
        message: "Course fetched successfully",
        course: result,
    });
});
module.exports = router;
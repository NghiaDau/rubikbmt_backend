var express = require("express");
var router = express.Router();
var CourseDetail = require("./../../entities/coursedetail");
var CourseDetailService = require("./../../services/courseDetailService");
router.post("/addCourseDetail", async function (req, res) {
    // Example of a valid request body:
    // {
    //     "actualFee":700000, 
    //     "Paid":500000, 
    //     "numberOfStudied":0, 
    //     "course":"67e3db451ab360dab0b5bbc0", 
    //     "student":"67e3761c4e751436f3bd5212", 
    //     "teacher":"67e02bb99a1e78a63d5e706a", 
    //     "sessions":[
    //       {
    //         "startTime":"2025-03-26T12:00:00Z",
    //         "endTime":"2025-03-26T12:45:00Z",
    //         "content":"conten1",
    //         "ao5":60
    //       } ,
    //       {
    //         "startTime":"2025-03-26T12:00:00Z",
    //         "endTime":"2025-03-27T12:45:00Z",
    //         "content":"conten2",
    //         "ao5":60
    //       } ,
    //       {
    //         "startTime":"2025-03-26T12:00:00Z",
    //         "endTime":"2025-03-28T12:45:00Z",
    //         "content":"conten3",
    //         "ao5":60
    //       } 
    //     ]
    //   }
    var { actualFee, Paid, numberOfStudied, course, student, teacher, sessions } = req.body;
    var courseDetail = new CourseDetail();
    courseDetail.actualFee = actualFee;
    courseDetail.Paid = Paid;
    courseDetail.numberOfStudied = numberOfStudied;
    courseDetail.course = course;
    courseDetail.student = student;
    courseDetail.teacher = teacher;
    var courseDetailService = new CourseDetailService();
    var result = await courseDetailService.addCourseDetail(courseDetail, sessions);
    res.json({
        message: "Course Detail added successfully",
        courseDetail: result,
    });
});
router.get("/getCourseDetailById", async function (req, res) {
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
router.put("/updateCourseDetail", async function (req, res) {
    var { _id, actualFee, Paid, numberOfStudied, course, student, teacher, evaluation, session } = req.body;
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
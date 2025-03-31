function validateCourseDetail(req,res,next){
    var errors = [];
    const { actualFee, Paid, numberOfStudied, course, student, teacher, sessions } = req.body;
    if (!actualFee) {
        errors.push("actualFee is required");
    }
    if (!Paid) {
        errors.push("Paid is required");
    }
    if (!numberOfStudied) {
        errors.push("numberOfStudied is required");
    }
    if (!course) {
        errors.push("course is required");
    }
    if (!student) {
        errors.push("student is required");
    }
    if (!teacher) {
        errors.push("teacher is required");
    }
    if (!sessions) {
        errors.push("sessions is required");
    }
    if (actualFee < 0) {
        errors.push("actualFee is invalid numerical values");
    }
    if (Paid < 0) {
        errors.push("Paid is invalid numerical values");
    }   
    if (numberOfStudied < 0) {
        errors.push("numberOfStudied is invalid numerical values");
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: "Invalid request",
            errors: errors,
        });
    }
    next(); // Chuyển sang middleware hoặc controller tiếp theo nếu hợp lệ
}
module.exports = validateCourseDetail;
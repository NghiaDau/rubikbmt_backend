function validateCourse(req, res, next) {
    var errors = [];
    const { name, description, requirement, target, min_age, max_age, minutesPerSesion, NumOfSession, fee, idCubeSubject, idLevel } = req.body;
    if (!name) {
        errors.push("Name is required");
    }
    if (!description) {
        errors.push("Description is required");
    }
    if (!requirement) {
        errors.push("Requirement is required");
    }
    if (!target) {
        errors.push("Target is required");
    }
    if (!idCubeSubject) {
        errors.push("idCubeSubject is required");
    }
    if (!idLevel) {
        errors.push("idLevel is required");
    }
    if(!min_age) {
        errors.push("min_age is required");
    }
    if(!max_age) {
        errors.push("max_age is required");
    }
    if(!fee) {
        errors.push("fee is required");
    }
    if(!minutesPerSesion) {
        errors.push("minutesPerSesion is required");
    }
    if(!NumOfSession) {
        errors.push("NumOfSession is required");
    }

    if (min_age < 0) {
        errors.push("min_age is invalid numerical values");
    }
    if (max_age < 0) {
        errors.push("max_age is invalid numerical values");
    }
    if (fee < 0) {
        errors.push("fee is invalid numerical values");
    }
    if (minutesPerSesion <= 0) {
        errors.push("minutesPerSesion is invalid numerical values");
    }
    if (NumOfSession <= 0) {
        errors.push("NumOfSession is invalid numerical values");
    }
    if(min_age > max_age) {
        errors.push("min_age is greater than max_age");
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            message: "Invalid request",
            errors: errors,
        });
    }
    next(); // Cho phép request tiếp tục nếu hợp lệ
}

module.exports = validateCourse;

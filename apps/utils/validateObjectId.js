const { ObjectId } = require("mongodb");

function validateObjectId(req, res, next) {
    const id = req.params.id || req.query.id || req.body.id; // Lấy ID từ request

    if (!id || !ObjectId.isValid(id) || String(new ObjectId(id)) !== id) {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    next(); // Chuyển sang middleware hoặc controller tiếp theo nếu hợp lệ
}

module.exports = validateObjectId;

var express = require("express");
const { ObjectId } = require("mongodb");
var router = express.Router();
var CubeSubject = require("./../../entities/cubesubject");
var CubeSubjectService = require("./../../services/cubeSubjectService");
var validateObjectId = require("./../../utils/validateObjectId");
var verifyToken = require("./../../utils/verifyToken");

router.post("/add", verifyToken, async function (req, res) {
  try {
    var { name, cubeSkills } = req.body;
    var cubeSubject = new CubeSubject();
    cubeSubject.name = name;
    cubeSubject.cubeSkills = cubeSkills;

    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.addCubeSubject(cubeSubject);

    res.status(201).json({
      message: "Thêm khối Rubik thành công",
      cubeSubject: result,
    });
  } catch (error) {
    console.error("Lỗi khi thêm:", error);
    res.status(500).json({ message: "Xảy ra lỗi trên Server" });
  }
});

router.get("/get-list", verifyToken, async function (req, res) {
  try {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjects();

    res.status(200).json({
      message: "Lấy danh sách khối Rubik thành công",
      cubeSubjects: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Xảy ra lỗi trên Server" });
  }
});

router.get("/get", verifyToken, validateObjectId, async function (req, res) {
  try {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjectById(req.query.id);

    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy khối Rubik" });
    }

    res.status(200).json({
      message: "Lấy thông tin khối Rubik thành công",
      cubeSubject: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Xảy ra lỗi trên Server" });
  }
});

router.put("/update", verifyToken, validateObjectId, async function (req, res) {
  try {
    var id = req.query.id;

    var { name, cubeSkills } = req.body;
    var cubeSubject = new CubeSubject();
    cubeSubject._id = new ObjectId(id);
    cubeSubject.name = name;
    cubeSubject.cubeSkills = cubeSkills;

    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.updateCubeSubject(cubeSubject);

    res.status(200).json({
      message: "Cập nhật khối Rubik thành công",
      cubeSubject: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Xảy ra lỗi trên Server" });
  }
});

router.get("/search", verifyToken, async function (req, res) {
  try {
    let { search = "", page = 1, limit = 10 } = req.query;

    // Chuyển đổi kiểu dữ liệu
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.searchCubeSubjects(search, skip, limit);
    var totalCount = await cubeSubjectService.countCubeSubject(search);

    res.status(200).json({
      message: "Tìm kiếm khối Rubik thành công",
      currentPage: page,
      limit: limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      cubeSubjects: result,
    });
  } catch (error) {
    console.error("Error searching CubeSubject:", error);
    res.status(500).json({ message: "Xảy ra lỗi trên Server" });
  }
});


module.exports = router;

var express = require("express");
const { ObjectId } = require("mongodb");
var router = express.Router();
var CubeSubject = require("./../../entities/cubesubject");
var CubeSubjectService = require("./../../services/cubeSubjectService");
var validateObjectId = require("./../../utils/validateObjectId");
var verifyToken = require("./../../utils/verifyToken");

router.post("/add", verifyToken, async function (req, res) {
  try {
    const { name, description, cubeSkills = [] } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        status: false,
        message: "Tên chủ đề không hợp lệ",
      });
    }

    if (!description || typeof description !== "string") {
      return res.status(400).json({
        status: false,
        message: "Mô tả không hợp lệ",
      });
    }

    if (!Array.isArray(cubeSkills)) {
      return res.status(400).json({
        status: false,
        message: "cubeSkills phải là một mảng",
      });
    }

    // Tạo đối tượng để lưu vào MongoDB
    const cubeSubject = {
      name,
      description,
      cubeSkills,
      status: -1, // Giá trị mặc định cho trạng thái
    };

    // Lưu vào MongoDB
    const result = await db.collection("cubeSubject").insertOne(cubeSubject);
    console.log("Saved CubeSubject:", result);

    // Trả về phản hồi thành công
    res.status(201).json({
      status: true,
      message: "Thêm khối Rubik thành công",
      data: result.ops[0], // Trả về đối tượng vừa lưu
    });
  } catch (error) {
    console.error("Error adding CubeSubject:", error); // Log lỗi chi tiết
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
    });
  }
});

router.get("/get-list", verifyToken, async function (req, res) {
  try {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjects();

    res.status(200).json({
      status: true,
      message: "Lấy danh sách khối Rubik thành công",
      data: {
        cubeSubjects: result, // Đảm bảo `cubeSubjects` nằm trong một object
      },
    });
  } catch (error) {
    console.error("Error fetching CubeSubjects:", error);
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server",
    });
  }
});

router.get("/get", verifyToken, validateObjectId, async function (req, res) {
  try {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjectById(req.query.id);

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy khối Rubik"
      });
    }

    res.status(200).json({
      status: true,
      message: "Lấy thông tin khối Rubik thành công",
      data: [{ cubeSubject: result }],
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server"
    });
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
      status: true,
      message: "Cập nhật khối Rubik thành công",
      data: [{ cubeSubject: result }],
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server"
    });
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
      status: true,
      message: "Tìm kiếm khối Rubik thành công",
      data: { currentPage: page,
        limit: limit,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        cubeSubjects: result
       },
    });
  } catch (error) {
    console.error("Error searching CubeSubject:", error);
    res.status(500).json({
      status: false,
      message: "Xảy ra lỗi trên Server"
    });
  }
});


module.exports = router;

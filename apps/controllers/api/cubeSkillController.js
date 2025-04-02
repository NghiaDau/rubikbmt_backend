var express = require("express");
var router = express.Router();
var CubeSkill = require("./../../entities/cubeskill");
var CubeSkillService = require("./../../services/cubeSkillService");
var validateObjectId = require("./../../utils/validateObjectId");
var verifyToken = require("./../../utils/verifyToken");
// API: Thêm CubeSkill
router.post("/add", verifyToken, async function (req, res) {
    try {
        var { name } = req.body;
        var cubeSkill = { name };

        var cubeSkillService = new CubeSkillService();
        var result = await cubeSkillService.addCubeSkill(cubeSkill);

        res.status(201).json({
            status: true,
            message: "Kỹ năng xoay khối Rubik được thêm thành công",
            data: { cubeSkill: result },
        });
    } catch (error) {
        console.error("Lỗi ở /add:", error);
        res.status(500).json({
            status: false,
            message: "Xảy ra lỗi trên Server", error: error.message
        });
    }
});

// API: Lấy danh sách CubeSkill
router.get("/get-list", verifyToken, async function (req, res) {
    try {
        var cubeSkillService = new CubeSkillService();
        var result = await cubeSkillService.getCubeSkills();

        res.json({
            status: true,
            message: "Lấy danh sách kỹ năng xoay khối Rubik thành công",
            data: { cubeSkills: result },
        });
    } catch (error) {
        console.error("Lỗi ở /get-list:", error);
        res.status(500).json({
            status: false,
            message: "Xảy ra lỗi trên Server",
            error: error.message
        });
    }
});

// API: Lấy CubeSkill theo ID
router.get("/get", verifyToken, validateObjectId, async function (req, res) {
    try {
        var cubeSkillService = new CubeSkillService();
        var result = await cubeSkillService.getCubeSkillById(req.query.id);

        if (!result) {
            return res.status(404).json({
                status: false,
                message: "Không tìm thấy kỹ năng xoay khối Rubik",
            });
        }

        res.json({
            status: true,
            message: "Lấy kỹ năng xoay khối Rubik thành công",
            data: { cubeSkill: result },
        });
    } catch (error) {
        console.error("Lỗi ở /get-cubeskill:", error);
        res.status(500).json({
            status: false,
            message: "Xảy ra lỗi trên Server",
            error: error.message
        });
    }
});

// API: Cập nhật CubeSkill
router.put("/update", verifyToken, async function (req, res) {
    try {
        var { _id, name, description } = req.body;
        var cubeSkill = { _id, name, description };

        var cubeSkillService = new CubeSkillService();
        var result = await cubeSkillService.updateCubeSkill(cubeSkill);

        res.status(200).json({
            status: true,
            message: "Cập nhật kỹ năng xoay khối Rubik thành công",
            data: { cubeSkill: result },
        });
    } catch (error) {
        console.error("Lỗi ở /update:", error);
        res.status(500).json({
            status: false,
            message: "Xảy ra lỗi trên Server",
            error: error.message
        });
    }
});

// API: Xóa CubeSkill theo ID
router.delete("/delete", verifyToken, validateObjectId, async function (req, res) {
    try {
        var cubeSkillService = new CubeSkillService();
        var result = await cubeSkillService.deleteCubeSkill(req.query.id);

        res.status(200).json({
            status: true,
            message: "Xóa kỹ năng xoay khối Rubik thành công",
            data: { cubeSkill: result },
        });
    } catch (error) {
        console.error("Lỗi ở /delete:", error);
        res.status(500).json({
            status: false,
            message: "Xảy ra lỗi trên Server",
            error: error.message
        });
    }
});

module.exports = router;

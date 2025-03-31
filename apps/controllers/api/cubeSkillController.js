var express = require("express");
var router = express.Router();
var CubeSkill = require("./../../entities/cubeskill");
var CubeSkillService = require("./../../services/cubeSkillService");
var validateObjectId = require("./../../utils/validateObjectId");
// API: Thêm CubeSkill
router.post("/add", async function (req, res) {
  try {
      var { name } = req.body;
      var cubeSkill = { name };

      var cubeSkillService = new CubeSkillService();
      var result = await cubeSkillService.addCubeSkill(cubeSkill);

      res.json({
          message: "Cube Skill added successfully",
          cubeSkill: result,
      });
  } catch (error) {
      console.error("❌ Error in /add:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// API: Lấy danh sách CubeSkill
router.get("/get-list", async function (req, res) {
  try {
      var cubeSkillService = new CubeSkillService();
      var result = await cubeSkillService.getCubeSkills();

      res.json({
          message: "Cube Skills fetched successfully",
          cubeSkills: result,
      });
  } catch (error) {
      console.error("❌ Error in /get-list:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// API: Lấy CubeSkill theo ID
router.get("/get-cubeskill", validateObjectId, async function (req, res) {
  try {
      var cubeSkillService = new CubeSkillService();
      var result = await cubeSkillService.getCubeSkillById(req.query.id);

      if (!result) {
          return res.status(404).json({
              message: "Cube Skill not found",
          });
      }

      res.json({
          message: "Cube Skill fetched successfully",
          cubeSkill: result,
      });
  } catch (error) {
      console.error("❌ Error in /get-cubeskill:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// API: Cập nhật CubeSkill
router.put("/update", async function (req, res) {
  try {
      var { _id, name, description } = req.body;
      var cubeSkill = { _id, name, description };

      var cubeSkillService = new CubeSkillService();
      var result = await cubeSkillService.updateCubeSkill(cubeSkill);

      res.json({
          message: "Cube Skill updated successfully",
          cubeSkill: result,
      });
  } catch (error) {
      console.error("❌ Error in /update:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// API: Xóa CubeSkill theo ID
router.delete("/delete", validateObjectId, async function (req, res) {
  try {
      var cubeSkillService = new CubeSkillService();
      var result = await cubeSkillService.deleteCubeSkill(req.query.id);

      res.json({
          message: "Cube Skill deleted successfully",
          cubeSkill: result,
      });
  } catch (error) {
      console.error("❌ Error in /delete:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;

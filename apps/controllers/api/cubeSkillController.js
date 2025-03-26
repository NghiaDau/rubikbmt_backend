var express = require("express");
var router = express.Router();
var CubeSkill = require("./../../entities/cubeskill");
var CubeSkillService = require("./../../services/cubeSkillService");
var validateObjectId = require("./../../utils/validateObjectId");
router.post("/add", async function (req, res) {
  var { name } = req.body;
  var cubeSkill = new CubeSkill();
  cubeSkill.name = name;
  var cubeSkillService = new CubeSkillService();
  var result = await cubeSkillService.addCubeSkill(cubeSkill);
  res.json({
    message: "Cube Skill added successfully",
    cubeSkill: result,
  });
});
router.get("/get-list", async function (req, res) {
  var cubeSkillService = new CubeSkillService();
  var result = await cubeSkillService.getCubeSkills();
  res.json({
    message: "Cube Skills fetched successfully",
    cubeSkills: result,
  });
});
router.get("/get-cubeskill", validateObjectId, async function (req, res) {
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
});
router.put("/update", async function (req, res) {
  var { _id, name, description } = req.body;
  var cubeSkill = new CubeSkill();
  cubeSkill._id = _id;
  cubeSkill.name = name;
  cubeSkill.description = description;
  var cubeSkillService = new CubeSkillService();
  var result = await cubeSkillService.updateCubeSkill(cubeSkill);
  res.json({
    message: "Cube Skill updated successfully",
    cubeSkill: result,
  });
});
router.delete("/delete", validateObjectId, async function (req, res) {
  var cubeSkillService = new CubeSkillService();
  var result = await cubeSkillService.deleteCubeSkill(req.query.id);
  res.json({
    message: "Cube Skill deleted successfully",
    cubeSkill: result,
  });
});
module.exports = router;

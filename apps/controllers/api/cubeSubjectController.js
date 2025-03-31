var express = require("express");
const { ObjectId } = require("mongodb");
var router = express.Router();
var CubeSubject = require("./../../entities/cubesubject");
var CubeSubjectService = require("./../../services/cubeSubjectService");

router.post("/add", async function (req, res) {
  try {
    var { name, cubeSkills } = req.body;
    var cubeSubject = new CubeSubject();
    cubeSubject.name = name;
    cubeSubject.cubeSkills = cubeSkills;
    
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.addCubeSubject(cubeSubject);
    
    res.json({
      message: "CubeSubject added successfully",
      cubeSubject: result,
    });
  } catch (error) {
    console.error("Error adding CubeSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-list", async function (req, res) {
  try {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjects();
    
    res.json({
      message: "CubeSubjects fetched successfully",
      cubeSubjects: result,
    });
  } catch (error) {
    console.error("Error fetching CubeSubjects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-cube-subject", async function (req, res) {
  try {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjectById(req.query.id);
    
    if (!result) {
      return res.status(404).json({ message: "CubeSubject not found" });
    }
    
    res.json({
      message: "CubeSubject fetched successfully",
      cubeSubject: result,
    });
  } catch (error) {
    console.error("Error fetching CubeSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update", async function (req, res) {
  try {
    var id = req.query.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    var { name, cubeSkills } = req.body;
    var cubeSubject = new CubeSubject();
    cubeSubject._id = new ObjectId(id);
    cubeSubject.name = name;
    cubeSubject.cubeSkills = cubeSkills;
    
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.updateCubeSubject(cubeSubject);
    
    res.json({
      message: "CubeSubject updated successfully",
      cubeSubject: result,
    });
  } catch (error) {
    console.error("Error updating CubeSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/search", async function (req, res) {
  try {
    let { search = "", page = 1, limit = 10 } = req.query;
    
    // Chuyển đổi kiểu dữ liệu
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.searchCubeSubjects(search, skip, limit);
    var totalCount = await cubeSubjectService.countCubeSubject(search);
        
    res.json({
      message: "CubeSubject fetched successfully",
      currentPage: page,
      limit: limit,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      levels: result,
    });
  } catch (error) {
    console.error("Error searching CubeSubject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;

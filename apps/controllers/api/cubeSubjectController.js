var express = require("express");
const { ObjectId } = require("mongodb");
var router = express.Router();
var CubeSubject = require("./../../entities/cubesubject");
var CubeSubjectService = require("./../../services/cubeSubjectService");
var CubeSkillService = require("./../../services/cubeSkillService");
router.post("/addCubeSubject", async function (req, res) {
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
});
router.get("/getCubeSubjects", async function (req, res) {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjects();

    res.json({
        message: "CubeSubjects fetched successfully",
        cubeSubjects: result,
    });
});
router.get("/getCubeSubjectById", async function (req, res) {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjectById(req.query.id);
    if (!result) {
        return res.status(404).json({
            message: "CubeSubject not found",
        });
    }
    res.json({
        message: "CubeSubject fetched successfully",
        cubeSubject: result,
    });
});
router.get("/getCubeSubjectNameById", async function (req, res) {
    var cubeSubjectService = new CubeSubjectService();
    var result = await cubeSubjectService.getCubeSubjectNameById(req.query.id);
    if (!result) {
        return res.status(404).json({
            message: "CubeSubject not found",
        });
    }
    res.json({
        message: "CubeSubject fetched successfully",
        cubeSubject: result,
    });
});
router.put("/updateCubeSubject", async function (req, res) {
    var id = req.query.id;
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
});
module.exports = router;
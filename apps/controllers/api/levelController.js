var express = require("express");
var router = express.Router();
var Level = require("./../../entities/level");
var LevelService = require("./../../services/levelService");
var verifyToken = require("./../../utils/verifyToken");
var validateObjectId = require("./../../utils/validateObjectId");

router.post("/add",verifyToken, async function (req, res) {
  try {
    var { name } = req.body;
    var level = new Level();
    level.name = name;
    
    var levelService = new LevelService();
    var result = await levelService.addLevel(level);
    
    res.status(201).json({
      message: "Thêm Level thành công",
      level: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Xảy ra lỗi trên Server" });
  }
});

router.get("/get-list",verifyToken, async function (req, res) {
  try {
    var levelService = new LevelService();
    var result = await levelService.getLevels();
    
    res.status(200).json({
      message: "Lấy danh sách level thành công",
      levels: result,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách level:", error);
    res.status(500).json({ message: "Xảy ra lỗi trên Server" });
  }
});

router.get("/get",verifyToken,validateObjectId, async function (req, res) {
  try {
    var levelService = new LevelService();
    var result = await levelService.getLevelById(req.query.id);
    
    if (!result) {
      return res.status(404).json({ message: "Không tìm thấy Level" });
    }
    
    res.status(200).json({
      message: "Lấy thông tin Level thành công",
      level: result,
    });
  } catch (error) {
    console.error("Lỗi lấy level:", error);
    res.status(500).json({ message: "Xảy ra lỗi trên Server" });
  }
});


module.exports = router;

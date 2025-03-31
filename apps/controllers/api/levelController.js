var express = require("express");
var router = express.Router();
var Level = require("./../../entities/level");
var LevelService = require("./../../services/levelService");

router.post("/addLevel", async function (req, res) {
  try {
    var { name } = req.body;
    var level = new Level();
    level.name = name;
    
    var levelService = new LevelService();
    var result = await levelService.addLevel(level);
    
    res.json({
      message: "Level added successfully",
      level: result,
    });
  } catch (error) {
    console.error("Error adding Level:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getLevels", async function (req, res) {
  try {
    var levelService = new LevelService();
    var result = await levelService.getLevels();
    
    res.json({
      message: "Levels fetched successfully",
      levels: result,
    });
  } catch (error) {
    console.error("Error fetching Levels:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getLevelNameById", async function (req, res) {
  try {
    var { id } = req.query;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    var levelService = new LevelService();
    var result = await levelService.getLevelNameById(id);
    
    if (!result) {
      return res.status(404).json({ message: "Level not found" });
    }
    
    res.json({
      message: "Level fetched successfully",
      level: result,
    });
  } catch (error) {
    console.error("Error fetching Level by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

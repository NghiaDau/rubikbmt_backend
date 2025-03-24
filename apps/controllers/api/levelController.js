var express = require("express");
var router = express.Router();
var Level = require("./../../entities/level");
var LevelService = require("./../../services/levelService");
router.post("/addLevel", async function (req, res) {
    var { name } = req.body;
    var level = new Level();
    level.name = name;
    var levelService = new LevelService();
    var result = await levelService.addLevel(level);
    res.json({
        message: "Level added successfully",
        level: result,
    });
});
router.get("/getLevels", async function (req, res) {
    var levelService = new LevelService();
    var result = await levelService.getLevels();
    res.json({
        message: "Levels fetched successfully",
        levels: result,
    });
});
module.exports = router;
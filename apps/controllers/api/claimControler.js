var express = require("express");
var router = express.Router();
var Claim = require("./../../entities/claim");
var ClaimService = require("./../../services/claimService");
var { ObjectId } = require("mongodb");


router.post("/add", async function (req, res) {
  try {
    var { roleId, claimName } = req.body;
    var claimService = new ClaimService();
    var existingClaim = await claimService.getClaimByRoleAndClaimName(
      roleId,
      claimName
    );
    if (existingClaim) {
      return res.status(409).json({
        message: "Claim name already exists for this role",
      });
    }
    var claim = new Claim();
    claim.roleId = roleId;
    claim.claimName = claimName;
    var result = await claimService.insertClaim(claim);
    res.status(200).json({
      message: "Claim added successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/update", async function (req, res) {
  try {
    var { roleId, claimName } = req.body;
    var claimService = new ClaimService();
    var existingClaim = await claimService.getClaimByRoleAndClaimName(
      roleId,
      claimName
    );
    if (existingClaim) {
      return res.status(409).json({
        message: "Claim name already exists for this role",
      });
    }
    var claim = new Claim();
    claim._id = new ObjectId(req.query.id);
    claim.roleId = roleId;
    claim.claimName = claimName;
    var result = await claimService.updateClaim(claim);
    res.status(200).json({
      message: "Claim updated successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/delete", async function (req, res) {
  try {
    var claimService = new ClaimService();
    var result = await claimService.deleteClaim(req.query.id);
    res.status(200).json({
      message: "Claim deleted successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();
var { ObjectId } = require("mongodb");
var Role = require("./../../entities/role");
var RoleService = require("./../../services/roleService");
var ClaimService = require("./../../services/claimService");
var verifyToken = require("./../../utils/verifyToken");

router.post("/add", verifyToken, async function (req, res) {
  try {
    var permision = req.userData.claims.includes("role.add");
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "You do not have permision." });
    }
    var { rolename } = req.body;
    var roleService = new RoleService();
    var existingRole = await roleService.getRoleByRoleName(rolename);
    console.log(existingRole);
    if (existingRole) {
      return res.status(409).json({
        status: false,
        message: "Role name already exists",
      });
    }
    var role = new Role();
    role.roleName = rolename;
    var result = await roleService.insertRole(role);
    return res.status(200).json({
      status: true,
      message: "Role added successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/update", verifyToken, async function (req, res) {
  try {
    var permision = req.userData.claims.includes("role.update");
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "You do not have permision." });
    }
    var roleService = new RoleService();
    var { rolename } = req.body;
    var id = req.query.id;
    var existingRoleId = await roleService.getRoleById(id);
    if (!existingRoleId) {
      return res.status(404).json({
        status: false,
        message: "RoleId not found",
      });
    }
    var existingRole = await roleService.getRoleByRoleName(rolename);
    if (existingRole) {
      if (existingRole._id.toString() != id) {
        return res.status(409).json({
          status: false,
          message: "Role name already exists",
        });
      }
    }
    var role = new Role();
    role._id = new ObjectId(id);
    role.roleName = rolename;
    var result = await roleService.updateRole(role);
    return res.status(200).json({
      status: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/delete", verifyToken, async function (req, res) {
  try {
    var permision = req.userData.claims.includes("role.delete");
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "You do not have permision." });
    }
    var roleId = req.query.id;
    var claimService = new ClaimService();
    var claim = await claimService.getClaimByRoleId(roleId);
    if (claim) {
      return res.status(409).json({
        status: false,
        message: "Role is already assigned to claim",
      });
    }
    var roleService = new RoleService();
    var result = await roleService.deleteRole(roleId);

    return res.status(200).json({
      status: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;

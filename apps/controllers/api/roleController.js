var express = require("express");
var router = express.Router();
var { ObjectId } = require("mongodb");
var Role = require("./../../entities/role");
var RoleService = require("./../../services/roleService");
var ClaimService = require("./../../services/claimService");

router.post("/add", async function (req, res) {
  try {
    var { rolename } = req.body;
    var roleService = new RoleService();
    var existingRole = await roleService.getRoleByRoleName(rolename);
    console.log(existingRole);
    if (existingRole) {
      return res.json({
        status: false,
        message: "Role name already exists",
      });
    }
    var role = new Role();
    role.roleName = rolename;
    var result = await roleService.insertRole(role);
    return res.json({
      status: true,
      message: "Role added successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/update", async function (req, res) {
  try {
    var roleService = new RoleService();
    var { rolename } = req.body;
    var id = req.query.id;
    var existingRoleId = await roleService.getRoleById(id);
    if (!existingRoleId) {
      return res.json({
        status: false,
        message: "RoleId not found",
      });
    }
    var existingRole = await roleService.getRoleByRoleName(rolename);
    if (existingRole) {
      if (existingRole._id.toString() != id) {
        return res.json({
          status: false,
          message: "Role name already exists",
        });
      }
    }
    var role = new Role();
    role._id = new ObjectId(id);
    role.roleName = rolename;
    var result = await roleService.updateRole(role);
    return res.json({
      status: true,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

router.delete("/delete", async function (req, res) {
  try {
    var roleId = req.query.id;
    var claimService = new ClaimService();
    var claim = await claimService.getClaimByRoleId(roleId);
    if (claim) {
      return res.json({
        status: false,
        message: "Role is already assigned to claim",
      });
    }
    var roleService = new RoleService();
    var result = await roleService.deleteRole(roleId);

    return res.json({
      status: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;

var express = require("express");
var router = express.Router();
var User = require("./../../entities/user");
var AuthService = require("./../../services/authService");
var RoleService = require("./../../services/roleService");
var UserRole = require("./../../entities/user_role");
var UserRoleService = require("./../../services/userRoleService");
var ClaimService = require("./../../services/claimService");
var transpost = require("../../utils/sendMail");
var { ObjectId } = require("mongodb");
var {
  doHashPassword,
  doHashValidPassWord,
  generatePassword,
} = require("../../utils/hashing");
var jsonwebtoken = require("jsonwebtoken");
const Role = require("../../entities/role");
const jwtExpirySeconds = 600;
var config = require("./../../../config/setting.json");
var verifyToken = require("./../../utils/verifyToken");

router.post("/login", async function (req, res) {
  try {
    var { email, password } = req.body;
    var authService = new AuthService();
    var user = await authService.getUserByEmail(email);
    if (!user) {
      return res.json({
        status: false,
        message: "User not found",
      });
    }
    var checkPass = await doHashValidPassWord(password, user.password);
    if (!checkPass) {
      return res.json({
        status: false,
        message: "Invalid password",
      });
    }

    var roleService = new RoleService();
    var userRoleService = new UserRoleService();
    var listRoleId = await userRoleService.getRoleIdsByUserId(
      user._id.toString()
    );
    var authorities = [];
    for (var element of listRoleId) {
      var role = await roleService.getRoleById(element);
      authorities.push(role.roleName);
    }
    var claimService = new ClaimService();
    var claimService = new ClaimService();
    var claims = new Set();
    for (var element of listRoleId) {
      var claims1 = await claimService.getClaimsByRoleId(element.toString());
      claims1.forEach((claim) => claims.add(claim));
    }
    claims = Array.from(claims);

    var token = jsonwebtoken.sign(
      { user: email, roles: authorities, claims: claims },
      config.jwt.secret,
      { expiresIn: jwtExpirySeconds }
    );

    return res.json({
      status: true,
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", async function (req, res) {
  var { phone, email } = req.body;
  var authService = new AuthService();
  var existingUser = await authService.getUserByEmail(email);
  if (existingUser) {
    return res.json({ status: false, message: "Email already exist." });
  }

  var user = new User();
  user.email = email;
  user.phone = phone;

  var generatePass = generatePassword(8);
  let info = await transpost.sendMail({
    from: process.env.NODE_CODE_SENDING_EMAIL_ADRESS,
    to: email,
    subject: "Rubikbmt Password",
    text: `Mật khẩu của bạn là: ${generatePass}`,
  });

  user.password = await doHashPassword(generatePass, 10);
  user.createDate = Date.now();
  var result = await authService.insertUser(user);
  var roleService = new RoleService();
  var role = await roleService.getRoleByRoleName("student");
  var userRoleService = new UserRoleService();
  var userRole = new UserRole();
  userRole.userId = result.insertedId.toString();
  userRole.roleId = role._id.toString();
  var result1 = await userRoleService.insertUserRole(userRole);
  res.json({
    status: true,
    message: "User registered successfully",
    user: result,
  });
});

router.post("/change-password", verifyToken, async (req, res) => {
  try {
    var email = req.userData.user;
    var { oldPassword, newPassword } = req.body;
    var authService = new AuthService();
    var existingUser = await authService.getUserByEmail(email);
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Email does not exist" });
    }

    var checkPass = await doHashValidPassWord(
      oldPassword,
      existingUser.password
    );
    if (!checkPass) {
      return res.json({
        status: false,
        message: "Invalid password",
      });
    }

    var hashedPassword = await doHashPassword(newPassword, 10);
    existingUser.password = hashedPassword;
    var result = await authService.updateUser(existingUser);
    res.json({ status: true, message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    var { email } = req.body;
    var authService = new AuthService();
    var existingUser = await authService.getUserByEmail(email);
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Email does not exist" });
    }

    var generatePass = generatePassword(8);
    let info = await transpost.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADRESS,
      to: email,
      subject: "Rubikbmt Password",
      text: `Mật khẩu mới của bạn là: ${generatePass}`,
    });
    var hashedPassword = await doHashPassword(generatePass, 10);
    existingUser.password = hashedPassword;
    var result = await authService.updateUser(existingUser);
    res.json({ status: true, message: "Check email for new password" });
  } catch (error) {
    console.log(error);
  }
});
router.delete("/test-security", verifyToken, (req, res) => {
  console.log(req.userData);
  var permision = req.userData.claims.includes("user.test1");
  if (!permision) {
    res.json({ status: false, message: "You do not have permision." });
  }
  res.json({ message: "OK ban oi" });
});
module.exports = router;

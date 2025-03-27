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
const { GridFSBucket } = require("mongodb");
var {
  doHashPassword,
  doHashValidPassWord,
  generatePassword,
} = require("../../utils/hashing");
var jsonwebtoken = require("jsonwebtoken");
const jwtExpirySeconds = 600;
var config = require("./../../../config/setting.json");
var verifyToken = require("./../../utils/verifyToken");
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.post("/login", async function (req, res) {
  try {
    var { email, password } = req.body;
    var authService = new AuthService();
    var user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Tài khoản không tồn tại!",
      });
    }
    var checkPass = await doHashValidPassWord(password, user.password);
    if (!checkPass) {
      return res.status(401).json({
        status: false,
        message: "Sai mật khẩu!",
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
    res.cookie("token", token, {
      maxAge: jwtExpirySeconds * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      status: true,
      message: "Đăng nhập thành công!",
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/register", async function (req, res) {
  var { firstName, lastName, phone, email } = req.body;
  var authService = new AuthService();
  var existingUser = await authService.getUserByEmail(email);
  if (existingUser) {
    return res
      .status(409)
      .json({ status: false, message: "Email đã được đăng ký!" });
  }

  var user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
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
  res.status(200).json({
    status: true,
    message: "Đăng ký thành công!",
    user: result,
  });
});

router.post("/change-password", verifyToken, async (req, res) => {
  try {
    var permision = req.userData.claims.includes("user.change-password");
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "Bạn không có quyền truy cập!" });
    }
    var email = req.userData.user;
    var { oldPassword, newPassword } = req.body;
    var authService = new AuthService();
    var existingUser = await authService.getUserByEmail(email);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "Email không tồn tại!" });
    }

    var checkPass = await doHashValidPassWord(
      oldPassword,
      existingUser.password
    );
    if (!checkPass) {
      return res.status(401).json({
        status: false,
        message: "Sai mật khẩu cũ!",
      });
    }

    var hashedPassword = await doHashPassword(newPassword, 10);
    existingUser.password = hashedPassword;
    var result = await authService.updateUser(existingUser);
    res.status(200).json({ status: true, message: "Đổi mật khẩu thành công!" });
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
        .status(404)
        .json({ success: false, message: "Email không tồn tại!" });
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
    res
      .status(200)
      .json({ status: true, message: "Kiểm tra email để lấy mật khẩu mới" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/logout", verifyToken, async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    return res.status(200).json({
      status: true,
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-user", verifyToken, async (req, res) => {
  try {
    var permision = req.userData.claims.includes(
      config.claims.user["get-user"]
    );
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "Bạn không có quyền truy cập!" });
    }
    var email = req.userData.user;
    console.log(req.userData);
    var authService = new AuthService();
    var existingUser = await authService.getUserByEmailIngnorePassword(email);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "Email không tồn tại!" });
    }

    return res.status(200).json({
      status: true,
      message: "Láy thông tin người dùng thành công!",
      user: existingUser,
      roles: req.userData.roles,
      claims: req.userData.claims,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/list-user", verifyToken, async (req, res) => {
  try {
    var permision = req.userData.claims.includes("user.list-user");
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "Bạn không có quyền truy cập!" });
    }
    var { page, limit } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    var authService = new AuthService();
    var userList = await authService.getUserList(page, limit);
    return res.status(200).json({
      status: true,
      message: "Lấy danh sách người dùng thành công!",
      data: userList,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post(
  "/update-profile",
  upload.single("avatar"),
  verifyToken,
  async (req, res) => {
    try {
      var permision = req.userData.claims.includes(
        config.claims.user.update_profile
      );
      if (!permision) {
        return res
          .status(403)
          .json({ status: false, message: "Bạn không có quyền truy cập!" });
      }
      var email = req.userData.user;
      var authService = new AuthService();
      var existingUser = await authService.getUserByEmail(email);
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "Email không tồn tại" });
      }
      var {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        desscription,
        parentName,
      } = req.body;
      existingUser.phone = phone;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.dateOfBirth = dateOfBirth;
      existingUser.desscription = desscription;
      existingUser.parentName = parentName;
      console.log(req.file);
      if (req.file) {
        var bucket = new GridFSBucket(authService.client.db(), {
          bucketName: "avatar",
        });
        var uploadStream = bucket.openUploadStream(req.file.originalname);
        uploadStream.end(req.file.buffer);
        existingUser.avatar = uploadStream.id;
      }

      var result = await authService.updateUser(existingUser);
      return res.status(200).json({
        status: true,
        message: "Cập nhật thông tin người dùng thành công!",
        data: existingUser,
      });
    } catch (error) {
      console.log(error);
    }
  }
);
router.get("/get-image/:id", async function (req, res) {
  try {
    var autheService = new AuthService();
    var bucket = new GridFSBucket(autheService.client.db(), {
      bucketName: "avatar",
    });

    var fileId = new ObjectId(req.params.id);
    var downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("data", (chunk) => {
      res.write(chunk);
    });

    downloadStream.on("error", (err) => {
      res.status(404).send({ message: "Ảnh không tồn tại!" });
    });

    downloadStream.on("end", () => {
      res.end();
    });
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).send({ message: "Đã xẩy ra lỗi khi lấy ảnh" });
  }
});
router.post("/test-security", verifyToken, (req, res) => {
  var permision = req.userData.claims.includes(
    config.claims.user["test-security"]
  );
  if (!permision) {
    return res
      .status(403)
      .json({ status: false, message: "Bạn không có quyền truy cập" });
  }
  return res.json({ message: "OK ban oi" });
});

module.exports = router;

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
const jwtExpirySecondsAccess = 600;
const jwtExpirySecondsRefress = 7 * 24 * 360 * 60;
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

    const roles = await Promise.all(
      listRoleId.map((id) => roleService.getRoleById(id))
    );
    const authorities = roles.map((role) => role.roleName);

    const claimService = new ClaimService();
    const claimsArrays = await Promise.all(
      listRoleId.map((id) => claimService.getClaimsByRoleId(id.toString()))
    );
    const allClaims = claimsArrays.flat();
    const claims = Array.from(new Set(allClaims));

    var token = jsonwebtoken.sign(
      { user: email, roles: authorities, claims: claims },
      config.jwt.access_secret,
      { expiresIn: jwtExpirySecondsAccess }
    );

    var refreshToken = jsonwebtoken.sign(
      { user: email },
      config.jwt.refresh_secret,
      { expiresIn: jwtExpirySecondsRefress }
    );

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 3600 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.cookie("token", token, {
      maxAge: jwtExpirySecondsAccess * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      status: true,
      message: "Đăng nhập thành công!",
      token: token,
      refreshToken: refreshToken,
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
  user.password = null;
  user.status = 0;
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
    message: "Đăng ký thành công! Vui lòng chờ xác nhận từ admin.",
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

router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        status: false,
        message: "Refresh token không tồn tại.",
      });
    }

    let decoded;
    try {
      decoded = jsonwebtoken.verify(refreshToken, config.jwt.refresh_secret);
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Refresh token không hợp lệ hoặc đã hết hạn.",
      });
    }

    const authService = new AuthService();
    const user = await authService.getUserByEmail(decoded.user);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy người dùng.",
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
    var claimsSet = new Set();
    for (var element of listRoleId) {
      var claims1 = await claimService.getClaimsByRoleId(element.toString());
      claims1.forEach((claim) => claimsSet.add(claim));
    }
    var claims = Array.from(claimsSet);

    var newAccessToken = jsonwebtoken.sign(
      { user: user.email, roles: authorities, claims: claims },
      config.jwt.refresh_secret,
      { expiresIn: jwtExpirySecondsAccess }
    );

    res.cookie("token", newAccessToken, {
      maxAge: jwtExpirySecondsAccess * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({
      status: true,
      message: "Access token đã được làm mới thành công.",
      token: newAccessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Đã xảy ra lỗi khi làm mới access token.",
    });
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
    var roleService = new RoleService();
    var userRoleService = new UserRoleService();

    var totalUsers = await authService.getUserCount();
    var totalPages = Math.ceil(totalUsers / limit);
    var userList = await authService.getUserList(page, limit);

    // Lấy roles cho từng user
    const usersWithRoles = await Promise.all(
      userList.map(async (user) => {
        const listRoleId = await userRoleService.getRoleIdsByUserId(
          user._id.toString()
        );
        const roles = await Promise.all(
          listRoleId.map((id) => roleService.getRoleById(id))
        );
        return {
          ...user,
          roles: roles.map((role) => role.roleName),
        };
      })
    );

    return res.status(200).json({
      status: true,
      message: "Lấy danh sách người dùng thành công!",
      data: usersWithRoles,
      totalUsers: totalUsers,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/list-teacher", verifyToken, async (req, res) => {
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
    var roleService = new RoleService();
    var userRoleService = new UserRoleService();

    var totalUsers = await authService.getUserCount();
    var totalPages = Math.ceil(totalUsers / limit);
    var userList = await authService.getUserList(page, limit);

    // Lấy roles cho từng user và lọc những user có role "teacher"
    const teachers = await Promise.all(
      userList.map(async (user) => {
        const listRoleId = await userRoleService.getRoleIdsByUserId(
          user._id.toString()
        );
        const roles = await Promise.all(
          listRoleId.map((id) => roleService.getRoleById(id))
        );
        const roleNames = roles.map((role) => role.roleName);
        console.log(roleNames);
        if (roleNames.includes("teacher")) {
          return {
            ...user,
            roles: roleNames,
          };
        }
        return null;
      })
    );

    const filteredTeachers = teachers.filter((teacher) => teacher !== null);

    return res.status(200).json({
      status: true,
      message: "Lấy danh sách giáo viên thành công!",
      data: filteredTeachers,
      totalUsers: filteredTeachers.length,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/list-student", verifyToken, async (req, res) => {
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
    var roleService = new RoleService();
    var userRoleService = new UserRoleService();

    var totalUsers = await authService.getUserCount();
    var totalPages = Math.ceil(totalUsers / limit);
    var userList = await authService.getUserList(page, limit);

    // Lấy roles cho từng user và lọc những user có role "teacher"
    const teachers = await Promise.all(
      userList.map(async (user) => {
        const listRoleId = await userRoleService.getRoleIdsByUserId(
          user._id.toString()
        );
        const roles = await Promise.all(
          listRoleId.map((id) => roleService.getRoleById(id))
        );
        const roleNames = roles.map((role) => role.roleName);
        if (roleNames.includes("student")) {
          return {
            ...user,
            roles: roleNames,
          };
        }
        return null;
      })
    );

    const filteredTeachers = teachers.filter((teacher) => teacher !== null);

    return res.status(200).json({
      status: true,
      message: "Lấy danh sách giáo viên thành công!",
      data: filteredTeachers,
      totalUsers: filteredTeachers.length,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
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
      var permission = req.userData.claims.includes(
        config.claims.user["update-profile"]
      );
      if (!permission) {
        return res
          .status(403)
          .json({ status: false, message: "Bạn không có quyền truy cập!" });
      }
      // var email = req.userData.user;

      var {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        description,
        parentName,
        email,
        _id,
      } = req.body;
      var authService = new AuthService();
      var existingUser = await authService.getUserById(_id);
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User không tồn tại" });
      }
      existingUser.email = email;
      existingUser.phone = phone;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.dateOfBirth = dateOfBirth;
      existingUser.description = description;
      existingUser.parentName = parentName;
      console.log(req.file);
      if (req.body.avatar === "null" || req.body.avatar === "") {
        existingUser.avatar = null;
      } else if (req.file) {
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

router.post("/confirm-account", verifyToken, async function (req, res) {
  try {
    var permision = req.userData.claims.includes("user.confirm-account");
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "Bạn không có quyền truy cập!" });
    }

    var { email } = req.body;
    var authService = new AuthService();
    var existingUser = await authService.getUserByEmail(email);

    if (!existingUser) {
      return res
        .status(404)
        .json({ status: false, message: "Email không tồn tại!" });
    }

    if (existingUser.status === 1) {
      return res.status(400).json({
        status: false,
        message: "Tài khoản đã được xác nhận trước đó!",
      });
    }

    // if (existingUser.status === -1) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Tài khoản đã bị vô hiệu hóa!",
    //   });
    // }

    // Tạo password và cập nhật status
    var generatePass = generatePassword(8);
    existingUser.password = await doHashPassword(generatePass, 10);
    existingUser.status = 1;

    await authService.updateUser(existingUser);

    // Gửi mail password
    await transpost.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADRESS,
      to: email,
      subject: "Xác nhận tài khoản Rubikbmt",
      text: `Xin chào ${existingUser.firstName} ${existingUser.lastName},\n\nTài khoản của bạn đã được xác nhận thành công.\nMật khẩu của bạn là: ${generatePass}`,
    });

    res.status(200).json({
      status: true,
      message: "Xác nhận tài khoản thành công!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Đã xảy ra lỗi khi xác nhận tài khoản!",
    });
  }
});

router.post("/add-user", verifyToken, async function (req, res) {
  try {
    console.log(req.body);
    var permision = req.userData.claims.includes("user.add-user");
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "Bạn không có quyền truy cập!" });
    }

    var { firstName, lastName, phone, email, parentName, roles } = req.body;
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
    user.parentName = parentName;
    user.status = 1;
    user.createDate = Date.now();

    var generatePass = generatePassword(8);
    user.password = await doHashPassword(generatePass, 10);

    var result = await authService.insertUser(user);

    // Thêm roles cho user
    var userRoleService = new UserRoleService();
    var roleService = new RoleService();

    await Promise.all(
      roles.map(async (roleName) => {
        const role = await roleService.getRoleByRoleName(roleName);
        if (role) {
          var userRole = new UserRole();
          userRole.userId = result.insertedId.toString();
          userRole.roleId = role._id.toString();
          await userRoleService.insertUserRole(userRole);
        }
      })
    );

    // Gửi mail password
    await transpost.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADRESS,
      to: email,
      subject: "Thông tin tài khoản RubikBMT",
      text: `Xin chào ${firstName} ${lastName},\n\nTài khoản của bạn đã được tạo thành công.\nMật khẩu của bạn là: ${generatePass}`,
    });

    res.status(200).json({
      status: true,
      message: "Thêm người dùng thành công!",
      user: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Đã xảy ra lỗi khi thêm người dùng!",
    });
  }
});

router.post("/disable-account", verifyToken, async function (req, res) {
  try {
    var permision = req.userData.claims.includes("user.disable-account");
    if (!permision) {
      return res
        .status(403)
        .json({ status: false, message: "Bạn không có quyền truy cập!" });
    }

    var { email } = req.body;
    var authService = new AuthService();
    var existingUser = await authService.getUserByEmail(email);

    if (!existingUser) {
      return res
        .status(404)
        .json({ status: false, message: "Email không tồn tại!" });
    }

    if (existingUser.status === -1) {
      return res.status(400).json({
        status: false,
        message: "Tài khoản đã bị vô hiệu hóa trước đó!",
      });
    }

    existingUser.status = -1;
    await authService.updateUser(existingUser);

    // Gửi mail thông báo
    await transpost.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADRESS,
      to: email,
      subject: "Thông báo vô hiệu hóa tài khoản Rubikbmt",
      text: `Xin chào ${existingUser.firstName} ${existingUser.lastName},\n\nTài khoản của bạn đã bị vô hiệu hóa.\nVui lòng liên hệ admin để biết thêm chi tiết.`,
    });

    res.status(200).json({
      status: true,
      message: "Vô hiệu hóa tài khoản thành công!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Đã xảy ra lỗi khi vô hiệu hóa tài khoản!",
    });
  }
});

module.exports = router;

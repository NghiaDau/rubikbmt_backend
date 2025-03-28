var jsonwebtoken = require("jsonwebtoken");
var config = require("./../../config/setting.json");

// verifyToken = (req, res, next) => {
//   if (req.headers["authorization"] == null) {
//     return res.status(401).send({ auth: false, message: "No token privided." });
//   }
//   var temp = req.headers["authorization"].split(" ");
//   if (temp.length < 2) {
//     return res.status(401).send({ auth: false, message: "No token privided." });
//   }
//   token = temp[1];
//   if (!token) {
//     return res.status(401).send({ auth: false, message: "No token privided." });
//   }
//   try {
//     const decode = jsonwebtoken.verify(token, config.jwt.secret);
//     let details = (req.userData = {
//       user: decode.user,
//       roles: decode.roles,
//       claims: decode.claims,
//     });
//     next();
//   } catch (error) {
//     return res
//       .status(401)
//       .send({ auth: false, message: "Failed to authenticate token." });
//   }
// };

verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }
  console.log(token);
  jsonwebtoken.verify(token, config.jwt.access_secret, (err, user) => {
    if (err) {
      return res.status(403).json({ status: false, message: "Forbidden" });
    }
  });
  try {
    const decode = jsonwebtoken.verify(token, config.jwt.access_secret);
    let details = (req.userData = {
      user: decode.user,
      roles: decode.roles,
      claims: decode.claims,
    });
    console.log(details);
    next();
  } catch (error) {
    return res
      .status(401)
      .send({ auth: false, message: "Failed to authenticate token." });
  }
};
module.exports = verifyToken;

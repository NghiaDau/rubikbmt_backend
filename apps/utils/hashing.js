const { hash, compare } = require("bcryptjs");
const { createHmac } = require("crypto");

generatePassword = (length) => {
  var lowerCharset = "abcdefghijklmnopqrstuvwxyz";
  var upperCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var numberCharset = "0123456789";
  var specialCharset = "!@#$%^&*";
  var allCharset = lowerCharset + upperCharset + numberCharset + specialCharset;

  var password = "";
  password += lowerCharset[Math.floor(Math.random() * lowerCharset.length)];
  password += upperCharset[Math.floor(Math.random() * upperCharset.length)];
  password += numberCharset[Math.floor(Math.random() * numberCharset.length)];
  password += specialCharset[Math.floor(Math.random() * specialCharset.length)];

  for (var i = 4; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * allCharset.length);
    password += allCharset[randomIndex];
  }

  // Shuffle the password to ensure randomness
  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
};

doHashPassword = (value, saltValue) => {
  var result = hash(value, saltValue);
  return result;
};

doHashValidPassWord = (value, hashedValue) => {
  var result = compare(value, hashedValue);
  return result;
};

hmacProcess = (value, key) => {
  var result = createHmac("sha256", key).update(value).digest("hex");
  return result;
};

module.exports = {
  doHashPassword,
  doHashValidPassWord,
  generatePassword,
};

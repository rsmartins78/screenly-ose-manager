const elastic = require("../models/ESUsers");
const { generateToken } = require("../../lib/token");
const { compareData } = require("../../lib/encrypt");

module.exports = {
  async login(req, res) {
    const user = req.body.username;
    const password = req.body.password;
    const result = await elastic.validateLogin(user);

    // Validating if user exists on DB
    if (result && result.hits.total === 1) {
      const passwdFromDb = result.hits.hits[0]._source.password;
      const checkPassword = compareData(password, passwdFromDb); // Checking password hash on database
      if (checkPassword) {
        const userId = result.hits.hits[0]._id;
        const group = result.hits.hits[0]._source.group;
        const token = await generateToken({ userId, user, group }); // Generating bearer token
        elastic.updateLoginAt(user);
        res.send({ success: true, token, userId });
      } else {
        res.status(403).send({ success: false, message: "incorrect password" });
      }
    } else {
      console.log("Login Failed for user: %s\nUser found: %s", user, false);
      res.status(403).send({ success: false, message: "username not found" });
    }
  },
  async checkSession(req, res) {
    res.status(200).send({ success: true, message: "user logged" });
  }
};

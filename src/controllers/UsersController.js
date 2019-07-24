const elastic = require("../models/ESUsers");
const { compareData } = require("../../lib/encrypt");

module.exports = {
  async createUser(req, res) {
    if (req.userData.group === "admin") {

      const data = {}

      data.name = res.body.name
      data.user = req.body.username;
      data.password = req.body.password;
      data.group = req.body.group;

      if (!data.group) {
        group = "users";
      }
      const result = await elastic.validateLogin(data.user);
      // Checking if user already exists on system
      if (result.hits.total !== 0) {
        res
          .status(400)
          .send({ success: false, message: "user already exists on system" });
      } else {
        const resultUser = await elastic.createUser({data});
        // Creating user on database
        if (resultUser.result === "created") {
          console.log("Novo Usuário Criado: ", user);
          res.status(200).send({
            success: true,
            message: "user created with success",
            username: user,
            id: resultUser._id
          });
        } else {
          console.log("Failed to create user\n", resultUser);
          res
            .status(503)
            .send({ success: false, message: "Failed to create user" });
        }
      }
    } else {
      res
        .status(403)
        .send({ success: false, message: "you aren't allowed to do this" });
    }
  },
  async getUsers(req, res) {
    if (req.userData.group === "admin") {
      const result = await elastic.getUsers();
      if (result.hits.total >= 1) {
        for (i in result.hits.hits) {
          delete result.hits.hits[i]._source.password; // removed password before send response
        }
        res.status(200).send(result.hits.hits);
      } else {
        res
          .status(404)
          .send({ success: false, message: "no users on database" });
      }
    } else {
      res
        .status(403)
        .send({ success: false, message: "you aren't allowed to do this" });
    }
  },
  async updatePassword(req, res) {
    const reqUser = req.userData.user;
    const user = req.body.username;
    if (reqUser == user) {
      const old_password = req.body.old_password;
      const new_password = req.body.new_password;
      const result = await elastic.validateLogin(user);
      // Validating if user exists on DB
      if (result.hits.total === 0) {
        res.status(403).send({ success: false, message: "username not found" });
      } else {
        const passwdFromDb = result.hits.hits[0]._source.password;
        const checkPassword = compareData(old_password, passwdFromDb); // Checking password hash on database
        if (checkPassword) {
          //   const userId = result.hits.hits[0]._id;
          const updateReponse = await elastic.updateUserPassword(
            user,
            new_password
          );
          if (
            updateReponse.result === "updated" ||
            updateReponse.result === "noop"
          ) {
            res.send({ success: true, message: "password updated" });
          } else {
            res
              .status(500)
              .send({ success: true, message: "failed to update password" });
          }
        } else {
          res
            .status(403)
            .send({ success: false, message: "incorrect password" });
        }
      }
    } else {
      res
        .status(403)
        .send({ success: false, message: "you are not allowed to do this" });
    }
  },
  async updateUser(req, res) {
    if (req.userData.group === "admin") {
      const objUser = {};
      const userId = req.params.id;
      const password = req.body.password;
      objUser.name = req.body.name;
      objUser.username = req.body.username;
      objUser.group = req.body.group;

      if (password != undefined) {
        objUser.password = req.body.password;
        const response = await elastic.updateUserWithPassword(userId, {
          objUser
        });
        if (response.result === "updated" || response.result === "noop") {
          res.send({ success: true, message: "user updated" });
        } else {
          res
            .status(500)
            .send({
              success: true,
              message: "failed to update update user",
              code: 20
            });
        }
      } else if (objUser.password == undefined) {
        const response = await elastic.updateUserWithoutPassword(userId, {
          objUser
        });
        if (response.result === "updated" || response.result === "noop") {
          res.send({ success: true, message: "user updated" });
        } else {
          res
            .status(500)
            .send({
              success: true,
              message: "failed to update update user",
              code: 30
            });
        }
      }
    } else {
      res
        .status(403)
        .send({ success: false, message: "you are not allowed to do this" });
    }
  },
  async getUserById(req, res) {
    const userId = req.params.id;
    const result = await elastic.getUserById(userId);
    if (result && result.hits.total === 1) {
      for (i in result.hits.hits) {
        delete result.hits.hits[i]._source.password;
      }
      res.status(200).send(result.hits.hits[0]._source);
    } else {
      res.status(404).send({ success: false, message: "user not found" });
    }
  },
  async deleteUser(req, res) {
    if (req.userData.group === "admin") {
      const userId = req.params.id;
      const result = await elastic.deleteUserById(userId);
      if (result && !result.status) {
        res.status(200).send({
          success: true,
          message: `User ${userId} removed with success`
        });
      } else if (result && result.status === 404) {
        res
          .status(404)
          .send({ success: false, message: JSON.parse(result.response) });
      }
    } else {
      res
        .status(403)
        .send({ success: false, message: "you are not allowed to do this" });
    }
  }
};

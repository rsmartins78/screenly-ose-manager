const ActiveDirectory = require("activedirectory");
const elastic = require("../models/ESUsers");
const { generateToken } = require("../../lib/token");
const { compareData } = require("../../lib/encrypt");
const { getTime } = require("../../lib/getTime");
const { sendToAuditLog } = require("../../lib/auditlog");

const config = {
  url: process.env.LdapUrl,
  baseDN: process.env.baseDN,
  username: process.env.username,
  password: process.env.password
};

const ad = new ActiveDirectory(config);

function findUserByUserNameOnAd(username) {
  return new Promise((resolve, reject) => {
    ad.findUser(username, (err, user) => {
      if (err) {
        reject(`Error to find user - ${username}.`);
      }

      resolve(user);
    });
  });
}

async function adLogin(req, res, dbData, existsOnDb = true) {
  const { username, password } = req.body;

        if(!username || !password) {
          return res.status(403).send({ success: false, message: "you must inform the user and the password" });
        }

      ad.authenticate(`${username}@indproj.com.br`, password, async (err, auth) => {
        if (err) {
            return res.status(403).send({ success: false, message: "incorrect password" });
        }

        if(auth) {
            if (existsOnDb) {
              const { _id: userId } = dbData.hits.hits[0];
              const { group, authType } = dbData.hits.hits[0]._source;
              const token = await generateToken({ userId, user: username, group });
              elastic.updateLoginAt(username);
              res.send({ success: true, token, userId, group, user: username, authType });
            } else {
              const { displayName: name } = await findUserByUserNameOnAd(username);
              const resultUser = await elastic.createUser({
                name,
                user: username,
                group: 'users',
                authType: 'external',
                createdAt: getTime(),
                lastLoginAt: getTime()
                });

              if (resultUser.result === "created") {
                const { _id: userId, user: username, group } = resultUser; 
                const token = await generateToken({ userId, user: username, group });
                console.log("Novo Usuário Criado: ", username);
                sendToAuditLog(username, "Add User", `Added ${username} to group users`);
                res.send({ success: true, token, userId, group: 'users', user: username });
              } else {
                console.log("Failed to create user\n", resultUser);
                res
                  .status(503)
                  .send({ success: false, message: "Failed to create user" });
              }
            } 
        }
      });
}

async function localLogin(req, res, dbData) {
  const { username, password } = req.body;
      const passwdFromDb = dbData.hits.hits[0]._source.password;
      const checkPassword = await compareData(password, passwdFromDb); // Checking password hash on database
      if (checkPassword) {
        const { _id: userId } = dbData.hits.hits[0];
        const { group } = dbData.hits.hits[0]._source;
        const token = await generateToken({ userId, user: username, group }); // Generating bearer token
        elastic.updateLoginAt(username);
        res.send({ success: true, token, userId, group, user: username });
      } else {
        res.status(403).send({ success: false, message: "incorrect password" });
      }
}

module.exports = {
  async login(req, res) {
    const { username, password } = req.body;
    const result = await elastic.validateLogin(username);
    console.table(result);
    if (result && result.hits.total >= 1) {
      const authType = result.hits.hits[0]._source.authType || '';
      if(authType === 'ldap') {
        await adLogin(req, res, result);  
      } else {
        await localLogin(req, res, result);
      }
    } else {
      await adLogin(req, res, result, false);
    }
  },
  async checkSession(req, res) {
    res.status(200).send({ success: true, message: "user logged", username: req.userData.user, group: req.userData.group });
  }
};

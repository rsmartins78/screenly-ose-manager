const client = require("./ESConn");
const { encryptData } = require("../../lib/encrypt");
const { getTime } = require("../../lib/getTime");

module.exports = {
  async validateLogin(user) {
    const result = await client.search({
      index: "screenly-users",
      type: "users",
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  "username.keyword": user
                }
              }
            ]
          }
        }
      }
    });
    return result;
  },
  async createUser(data) {
    const { name, user, password, group, authType } = data
    const time = await getTime();
    const new_passwd = await encryptData(password || '')
    const result = await client.index({
      index: "screenly-users",
      type: "users",
      body: {
        name,
        username: user,
        password: new_passwd,
        group,
        authType: authType || 'internal',
        createdAt: time,
        lastLoginAt: time
      }
    });
    return result;
  },
  async updateLoginAt(user, callback) {
    const search = await client.search({
      index: "screenly-users",
      type: "users",
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  "username.keyword": user
                }
              }
            ]
          }
        }
      }
    });
    const userId = search.hits.hits[0]._id;
    const time = await getTime();
    const resultUpdate = await client.update({
      index: "screenly-users",
      type: "users",
      id: userId,
      body: {
        doc: {
          username: user,
          password: search.hits.hits[0]._source.password,
          group: search.hits.hits[0]._source.group,
          createdAt: search.hits.hits[0]._source.createdAt,
          lastLoginAt: time
        }
      }
    });
    return resultUpdate;
  },
  async updateUserPassword(user, password) {
    const search = await client.search({
      index: "screenly-users",
      type: "users",
      body: {
        query: {
          bool: {
            must: [
              {
                term: {
                  "username.keyword": user
                }
              }
            ]
          }
        }
      }
    });
    const userId = search.hits.hits[0]._id;
    const new_passwd = await encryptData(password)
    const resultUpdate = await client.update({
      index: "screenly-users",
      type: "users",
      id: userId,
      body: {
        doc: {
          username: user,
          password: new_passwd,
          group: search.hits.hits[0]._source.group,
          createdAt: search.hits.hits[0]._source.createdAt,
          lastLoginAt: search.hits.hits[0]._source.lastLoginAt
        }
      }
    });
    return resultUpdate;
  },
  async updateUserWithPassword(userId, {objUser}) {
    const { name, username, group, password } = objUser
    const search = await client.search({
      index: "screenly-users",
      type: "users",
      body: {
        query: {
          match: {
            _id: userId
          }
        }
      }
    });
    const new_passwd = await encryptData(password);
    const resultUpdate = await client.update({
      index: "screenly-users",
      type: "users",
      id: userId,
      body: {
        doc: {
          name: name,
          username: username,
          password: new_passwd,
          group: group,
          createdAt: search.hits.hits[0]._source.createdAt,
          lastLoginAt: search.hits.hits[0]._source.lastLoginAt
        }
      }
    });
    return resultUpdate;
  },
  async updateUserWithoutPassword(userId, {objUser}) {
    const { name, username, group } = objUser
    const search = await client.search({
      index: "screenly-users",
      type: "users",
      body: {
        query: {
          match: {
            _id: userId
          }
        }
      }
    });
    const resultUpdate = await client.update({
      index: "screenly-users",
      type: "users",
      id: userId,
      body: {
        doc: {
          name: name,
          username: username,
          password: search.hits.hits[0]._source.password,
          group: group,
          createdAt: search.hits.hits[0]._source.createdAt,
          lastLoginAt: search.hits.hits[0]._source.lastLoginAt
        }
      }
    });
    return resultUpdate;
  },
  async getUsers() {
    let responseAll = {};
    responseAll["hits"] = {};
    responseAll.hits.hits = [];
    const responseQueue = [];

    responseQueue.push(
      await client.search({
      index: "screenly-users",
      type: "users",
      scroll: "30s",
      body: {
        query: {
          match_all: {}
        }
      }
    })
    );

    while (responseQueue.length) {
      const response = responseQueue.shift();

      responseAll.hits.hits = responseAll.hits.hits.concat(response.hits.hits);

      if (response.hits.total == responseAll.hits.hits.length) {
        break;
      }

      // get the next response if there are more to fetch
      responseQueue.push(
        await client.scroll({
          scrollId: response._scroll_id,
          scroll: "30s"
        })
      );
    }

    return responseAll;
  },
  async getUserById(id) {
    const result = await client.search({
      index: "screenly-users",
      type: "users",
      body: {
        query: {
          match: {
            _id: id
          }
        }
      }
    });

    return result;
  },
  async deleteUserById(id) {
    const result = await client.delete({
      index: "screenly-users",
      id,
      type: "users"
    });
    return result;
  }
};

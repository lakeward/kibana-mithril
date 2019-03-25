/**
 * @author Robin Duda
 *
 * Authenticates user+password combinations against a json file on disk.
 */

const Config = require("../config");
const Fetch = require('node-fetch');
const Hash = require("./hash");
const fs = require("fs");
const filePath = require("path").resolve(__dirname, "../../" + Config.acmUserFile());
const Logger = require("../logger");

const urlVerifyToken = getUrlVerifyToken();
const urlUrlVerifyPermissionType = getUrlVerifyPermissionType();

let users = [];

/**
 * Construct ACM URL to verify acmToken
 */
function getUrlVerifyToken() {
  return encodeURI(Config.acmProtocol() + "://" + Config.acmHost() + ":" + Config.acmPort() + "/acmserver/api/auth");
}

function getUrlVerifyPermissionType() {
  return encodeURI(Config.acmProtocol() + "://" + Config.acmHost() + ":" + Config.acmPort() + "/acmserver/api/permissiontypes/" + Config.acmPermissionType());
}


function load() {
  let data = "{}";
  try {
    data = fs.readFileSync(filePath, "utf-8");
  } catch (e) {
    throw e;
  }
  users = JSON.parse(data);
}

function save(callback) {
  fs.writeFile(filePath, JSON.stringify(users, null, 4), err => {
    if (err) {
      throw err;
    } else {
      callback();
    }
  });
}

load();

module.exports = {
  authenticate: function(username, password, callback) {
    Logger.log("Authenticate ACM", "info");
    if (username in users) {
      Hash.verify(users[username].password, password, equals => {
        if (equals) {
          callback(null, users[username]);
        } else {
          callback({ error: "password failure" });
        }
      });
    } else {
      callback({ error: "authentication failure" });
    }
  },

  create: function(username, password, callback) {
    Hash.password(password, hash => {
      users[username] = {
        uid: username,
        password: hash,
        groups: ["default"],
        secret: { verified: false }
      };
      save(() => callback());
    });
  },

  getSecret: function(username, callback) {
    if (username in users) {
      callback(true, users[username].secret);
    } else {
      callback(false);
    }
  },

  setSecret: function(username, secret) {
    if (!(username in users)) {
      users[username] = {};
    }
    users[username].secret = secret;
    save(() => {});
  },

  /**
   * Filter call against ACM
   *
   * @param {*} request
   */
  authenticationFilter: async function(request) {
    return await this.hasToken(request);
  },

  /**
   * Does request include acmToken
   *
   * @param {*} request
   */
  hasToken: async function(request) {
    return new Promise(function(resolve, reject) {
      let tokenExists = false;
      if (request.state[Config.acmTokenName()]) {
        tokenExists = true;
      }
      resolve(tokenExists);
    });
  },

  /**
   * Get acmToken
   *
   * @param {*} request
   */
  getToken: async function(request) {
    return new Promise(function(resolve, reject) {
      resolve(request.state[Config.acmTokenName()]);
    });
  },
  
  /**
   * Verify ACM token with ACM server
   *
   * @param {*} request
   */
  verifyToken: async function(request) {
    let acmToken = await this.getToken(request);
    let response = await Fetch(urlVerifyToken, {
      method: "put",
      body: JSON.stringify({ token: acmToken }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    if (response.status !== 200) {
      throw new Error(
        "acmToken was not valid; Returned error '" + response.statusText + "'"
      );
    } else {
      return true;
    }
  },

  /**
   * Verify user is configured with the correct permission type
   *
   * @param {*} request
   */
  verifyPermissionType: async function(request) {
    let acmToken = await this.getToken(request);
    let response = await Fetch(urlUrlVerifyPermissionType, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + acmToken
      }
    });

    if (response.status !== 200) {
      throw new Error(
        "User not configured with required permission type '" +
          Config.acmPermissionType +
          "'; Returned error '" +
          response.statusText +
          "'"
      );
    } else {
      return true;
    }
  }
};

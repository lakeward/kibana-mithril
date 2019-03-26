/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved.
 */

/**
 * Authenticates users based on the CORENA ACM application 'acmToken'
 *
 * @author Lauren Ward
 *
 */

const Jwt = require("jsonwebtoken");
const Util = require("util");
const Fetch = require("node-fetch");

const KibanaToken = require("./kibanatoken");
const Config = require("../config");
const Logger = require("../logger");

const urlAuth = getUrlAuth();
const urlUrlVerifyPermission = getUrlVerifyPermission();

module.exports = {
  /**
   * Using properties from acmToken, create Kibana token that is used to validate the system.
   * Add the token to the current handler, request state and request header.
   * Adding this enables Audit Manager to be less chatty with ACM for subsequent requests.
   *
   * @param {Object} request the Hapi http request object
   * @param {Object} handler the Hapi handler
   * @returns empty promise
   */
  setKibanaToken: async (request, handler) => {
    let authToken = await module.exports.getToken(request);
    let decodeToken = Jwt.decode(authToken);

    return new Promise((resolve, reject) => {
      let token = KibanaToken.signToken(
        decodeToken.sub,
        decodeToken.groups,
        decodeToken.exp,
        decodeToken.iat
      );

      handler.state(Config.tokenName(), token, Config.cookie());
      request.state[Config.tokenName()] = token;

      if (request.headers.cookie) {
        request.headers.cookie += `; ${Config.tokenName()}=${token}`;
      } else {
        request.headers.cookie = `${Config.tokenName()}=${token}`;
      }

      resolve();
    });
  },

  /**
   * Test if request contains an acmToken
   *
   * @param request the http request object
   */
  hasToken: async request => {
    return new Promise(function(resolve, reject) {
      let tokenExists = false;
      if (request.state[Config.acmTokenName()]) {
        tokenExists = true;
      }
      resolve(tokenExists);
    });
  },

  /**
   * Get the acmToken from the request
   *
   * @param request the Hapi http request object
   */
  getToken: async request => {
    return new Promise(function(resolve, reject) {
      resolve(request.state[Config.acmTokenName()]);
    });
  },

  /**
   * Verify the acmToken with the ACM server
   *
   * @param {Object} request the Hapi http request object
   */
  verifyToken: async request => {
    let acmToken = await module.exports.getToken(request);
    let response = await Fetch(urlAuth, {
      method: "put",
      body: JSON.stringify({
        token: acmToken
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    if (response.status !== 200) {
      throw new Error(
        `acmToken was not valid; Returned error '${response.statusText}'`
      );
    } else {
      return true;
    }
  },

  /**
   * Verify the ACM user has the correct ACM permission type
   *
   * @param {Object} request the http request object
   */
  verifyPermissions: async request => {
    let acmToken = await module.exports.getToken(request);
    let response = await Fetch(urlUrlVerifyPermission, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + acmToken
      }
    });

    if (response.status !== 200) {
      throw new Error(
        `User not configured with required permission type '${
          Config.acmPermissionType
        }'; Returned error '${response.statusText}'`
      );
    } else {
      return true;
    }
  },

  /**
   * @param {Object} request the http request object
   */
  verifyPermissions: async request => {
    let acmToken = await module.exports.getToken(request);
    let response = await Fetch(urlUrlVerifyPermission, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + acmToken
      }
    });

    if (response.status !== 200) {
      throw new Error(
        `User not configured with required permission type '${
          Config.acmPermissionType
        }'; Returned error '${response.statusText}'`
      );
    } else {
      return true;
    }
  },

  /**
   * Authenticate against ACM
   *
   * @param {string} username ACM user name
   * @param {string} password ACM user name password
   */
  authenticate: async (username, password) => {
    let response = await Fetch(urlAuth, {
      method: "post",
      body: JSON.stringify({
        username: username,
        password: password
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    });

    Logger.log(response);
    if (response.status !== 200) {
      throw new Error(
        `acmToken was not valid; Returned error '${response.statusText}'`
      );
    } else {
      return true;
    }
  }
};

/**
 * Construct ACM URL to authenticate
 */
function getUrlAuth() {
  return encodeURI(
    Config.acmProtocol() +
      "://" +
      Config.acmHost() +
      ":" +
      Config.acmPort() +
      "/acmserver/api/auth"
  );
}

/**
 * Construct ACM URL to verify permissions
 */
function getUrlVerifyPermission() {
  return encodeURI(
    Config.acmProtocol() +
      "://" +
      Config.acmHost() +
      ":" +
      Config.acmPort() +
      "/acmserver/api/permissiontypes/" +
      Config.acmPermissionType()
  );
}

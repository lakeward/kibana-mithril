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
const urlVerifyAuth = getUrlVerifyAuth();
const urlUrlVerifyPermission = getUrlVerifyPermission();


module.exports = {

  /**
   * Using properties from ACTIVITI_REMEMBER_ME, create Kibana token that is used to validate the system.
   * Add the token to the current handler, request state and request header.
   * Adding this enables Audit Manager to be less chatty with Insight for subsequent requests.
   *
   * @param {Object} request the Hapi http request object
   * @param {Object} handler the Hapi handler
   * @returns empty promise
   */
  setKibanaToken: async (request, handler) => {
    let authToken = await module.exports.getToken(request);
    let loginName = await module.exports.getLoginName(request);
    let capabilities = await module.exports.getCapabilities(request);

    return new Promise((resolve, reject) => {
      let token = KibanaToken.signToken(
        loginName,
        capabilities
      );

      handler.state(Config.tokenName(), token, Config.cookie());
      request.state[Config.tokenName()] = token;

      if (request.headers.cookie) {
        request.headers.cookie += `; ${Config.tokenName()}=${token}`;
      } else {
        request.headers.cookie = `${Config.tokenName()}=${token}`;
      }

      resolve(true);
    });
  },

  /**
   * Test if request contains an ACTIVITI_REMEMBER_ME
   *
   * @param request the http request object
   */
  hasToken: async (request) => {

    return new Promise(function(resolve, reject) {
      let tokenExists = false;
      if (request.state[Config.insightTokenName()]) {
        tokenExists = true;
      }
      resolve(tokenExists);
    });
  },

  /**
   * Get the ACTIVITI_REMEMBER_ME from the request
   *
   * @param request the Hapi http request object
   */
  getToken: async (request) => {
    return new Promise(function(resolve, reject) {
      resolve(request.state[Config.insightTokenName()]);
    });
  },

  /**
   * Verify the ACTIVITI_REMEMBER_ME with the Insight application
   *
   * @param {Object} request the Hapi http request object
   */
  verifyToken: async (request) => {
    let insightToken = await module.exports.getToken(request);
    let response = await Fetch(urlVerifyAuth, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: Config.insightTokenName() + "=" + insightToken
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
   * Get the login name. It is not stored in the ACTIVITI_REMEMBER_ME cookie.
   */
  getLoginName: async (request) => {
    let insightToken = await module.exports.getToken(request);
    let response = await Fetch(urlVerifyAuth, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: Config.insightTokenName() + "=" + insightToken
      }
    });
    let json = await response.json();
    
    if (response.status !== 200) {
      throw new Error(
        `Unable to verify permissions; Returned error '${response.statusText}'`
      );
    } else {
      return json["login"];
    }
  },
 

  /**
   * Get Insight capabilities
   *
   * @param {Object} request the http request object
   */
  getCapabilities: async (request) => {
    let insightToken = await module.exports.getToken(request);
    let response = await Fetch(urlUrlVerifyPermission, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: Config.insightTokenName() + "=" + insightToken
      }
    });

    let json = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `Unable to get Inight capabilities; Returned error '${response.statusText}'`
      );
    } else {
      return json.capabilities;
    }
  },


  /**
   * Verify the Insight user has the correct Insight capabilities
   *
   * @param {Object} request the http request object
   */
  verifyPermissions: async (request) => {
    let insightToken = await module.exports.getToken(request);
    let response = await Fetch(urlUrlVerifyPermission, {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: Config.insightTokenName() + "=" + insightToken
      }
    });

    let json = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `Unable to verify permissions; Returned error '${response.statusText}'`
      );
    } else if (json.capabilities && json.capabilities.indexOf(Config.insightPermissionType()) === -1) {
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
   * Authenticate against Insight. The only way to get a ACTIVITI_REMEMBER_ME cookie 
   * is through the UI REST call.
   *
   * @param {string} username Insight user name
   * @param {string} password Insight user name password
   */
  authenticate: async (username, password) => {

    let encodedUserName = encodeURIComponent(username);
    let encodedPassword = encodeURIComponent(password);

    let response = await Fetch(urlAuth, {
      method: "POST",
      body: `j_username=${encodedUserName}&j_password=${encodedPassword}&_spring_security_remember_me=true&submit=Login`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
         Accept: "application/json"
      }
    });

    if (response.status !== 200) {
      throw new Error(
        `Unable to authenticate; Insight returned error '${response.statusText}'`
      );
    } else {
      // Retrieve token from cookie header
      let token = response.headers.get('set-cookie').match(/ACTIVITI_REMEMBER_ME=(.*?);/);
      return token[1];
    }
  }
};

/**
 * Construct Insight URL to authenticate
 */
function getUrlAuth() {
  return encodeURI(
    Config.insightProtocol() +
      "://" +
      Config.insightHost() +
      ":" +
      Config.insightPort() +
      "/insight-app/app/authentication"
  );
}

/**
 * Consruct Insight URL to validate cookie
 */
function getUrlVerifyAuth() {
  return encodeURI(
    Config.insightProtocol() +
      "://" +
      Config.insightHost() +
      ":" +
      Config.insightPort() +
      "/insight-app/app/rest/authenticate"
  );
}

/**
 * Construct Insight URL to verify permissions
 */
function getUrlVerifyPermission() {
  return encodeURI(
    Config.insightProtocol() +
      "://" +
      Config.insightHost() +
      ":" +
      Config.insightPort() +
      "/insight-app/app/rest/account"
  );
}
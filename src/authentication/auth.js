/**
 * @author Robin Duda
 *
 * Authenticates users against configured authentication schemas
 */

const Jwt = require("jsonwebtoken");
const Config = require("../config");
const Logger = require("../logger");

// This is where method is defined
let AuthScheme = require("./" + Config.authScheme());

module.exports = {

  /**
   * Verifies the validity of a token.
   * @param token to be verified.
   * @return Boolean
   */
  verifyAmToken: (token) => {
    let decoded = Jwt.verify(token, Config.secret());
    let valid = new Date().getTime() < decoded.expiry;

    if (!decoded || !valid) {
      throw new Error();
    }

    return decoded;
  },

  /**
 * Get the Audit Manager token from request
 * @param {*} request 
 */
  hasAmToken: async (request) => {
    return new Promise(function (resolve, reject) {
      let tokenExists = false;
      if (request.state[Config.tokenName()]) {
        tokenExists = true;
      }
      resolve(tokenExists);
    });
  },

  /**
   * Set the Audit Manager token using the default credentials
   * 
   * @param {*} request 
   * @param {*} h 
   */
  setAmToken: async (request, h) => {
    return await AuthScheme.setAmToken(request, h);
  },

  hasAuthToken: async (request) => {
    return await AuthScheme.hasToken(request);
  },

  getAuthToken: async (request) => {
    return await AuthScheme.getToken(request);
  },

  verifyAuthToken: async (request) => {
    return await AuthScheme.verifyToken(request);
  },

  verifyAuthPermissions: async (request) => {
    return await AuthScheme.verifyPermissions(request);
  }
};

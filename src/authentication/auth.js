/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved.
 */

/**
 * Authenticates users against configured authentication schemas. This module
 * essentially provides an abstraction layer in front of a particular 
 * authentication scheme.
 *
 * @author Robin Duda
 * @author Lauren Ward
 *
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
  verifyKibanaToken: (token) => {
    let decoded = Jwt.verify(token, Config.secret());
    let valid = new Date().getTime() < decoded.expiry;

    if (!decoded || !valid) {
      throw new Error(`Kibana token is not valid`);
    }

    return decoded;
  },

  /**
   * Get the Kibana token from request
   * @param {*} request
   */
  hasKibanaToken: async (request) => {
    return new Promise(function(resolve, reject) {
      let tokenExists = false;
      if (request.state[Config.tokenName()]) {
        tokenExists = true;
      }
      resolve(tokenExists);
    });
  },

  /**
   * Set the Kibana token using the default credentials
   *
   * @param {Object} request the http request object
   * @param {*} h
   */
  setKibanaToken: async (request, h) => {
    return await AuthScheme.setKibanaToken(request, h);
  },

  /**
   * Test if the request has the authorization token
   * 
   * @param {Object} request the http request object
   */
  hasAuthToken: async (request) => {
    return await AuthScheme.hasToken(request);
  },

  /**
   * Get the authorization token from the request
   * 
   * @param {Object} request the http request object
   */
  getAuthToken: async (request) => {
    return await AuthScheme.getToken(request);
  },

  /**
   * Verfy the configured authorization token
   * 
   * @param {Object} request the http request object
   */
  verifyAuthToken: async (request) => {
    return await AuthScheme.verifyToken(request);
  },

  /**
   * Verify the user has the necessary permissions to access Kibana
   * 
   * @param {Object} request the http request object
   */
  verifyAuthPermissions: async (request) => {
    return await AuthScheme.verifyPermissions(request);
  }
};

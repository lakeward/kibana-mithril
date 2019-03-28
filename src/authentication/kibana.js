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
    return new Promise((resolve, reject) => {
      let token = KibanaToken.signToken(
        'user',
        ['default']
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
  }
}

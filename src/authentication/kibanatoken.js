/**
 * @author Lauren Ward
 *
 * Authenticates users based on the acmToken created generated from the CORENA ACM application
 * 
 */

const Crypto = require("crypto");
const Jwt = require("jsonwebtoken");
const Config = require("../config");
const Logger = require("../logger");

module.exports = {
  
    /**
     * Signs a JWT token with a configured secret.
     * https://github.com/auth0/node-jsonwebtoken/issues/488
     * @param uid the unique user id to sign token with.
     * @param groups the token is authorized for.
     * @returns {String}
     */
    /**
     * 
     * @param {*} uid 
     * @param {*} groups 
     * @param {*} expiry 
     * @param {*} iat 
     */
    signToken: function(uid, groups, expiry, iat) {
      return Jwt.sign(
        {
          id: uid,
          groups: groups,
          expiry: expiry * 1000,
          iat: iat * 1000
        },
        module.exports.secret()
      );
    },
  
    /**
     * Returns the secret key used to sign tokens.
     */
    secret: function() {
      if (!Config.secret()) {
        // generate a random secret if none is set.
        let secret = Crypto.randomBytes(64).toString("base64");
        Config.setSecret(secret);
        Logger.generatedSecret();
      }
      return Config.secret();
    }
}
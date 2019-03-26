/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved. Flatirons Solutions, Inc., 
 */

/**
 * Utility methods for signing the kibanaToken
 * 
 * @author Lauren Ward
 * 
 */

const Crypto = require("crypto");
const Jwt = require("jsonwebtoken");

const Config = require("../config");
const Logger = require("../logger");

module.exports = {
  
    /**
     * Signs a JWT token with a configured secret.
     * 
     * @param {String} uid the unique user id to sign token with.
     * @param {Object[]} groups the authorization groups.
     * @param {number} expiry 
     * @param {number} iat 
     * 
     * @return JWT signed token
     */
    signToken: function(uid, groups, expiry, iat) {
      return Jwt.sign(
        {
          id: uid,
          groups: groups,
          expiry: (expiry ? (expiry * 1000) : new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
          iat: (iat ? (iat* 1000) : new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
        },
        module.exports.secret()
      );
    },
  
    /**
     * Get/create secret JWT token.
     * 
     * @return secret for JWT token
     */
    secret: function() {

      // generate a random secret if none is set.
      if (!Config.secret()) {
        let secret = Crypto.randomBytes(64).toString("base64");
        Config.setSecret(secret);
        Logger.generatedSecret();
      }

      return Config.secret();
    }
}

/**
 * Construct ACM URL to verify acmToken
 */
function getUrlVerifyToken() {
  return encodeURI(Config.acmProtocol() + "://" + Config.acmHost() + ":" + Config.acmPort() + "/acmserver/api/auth");
}

/**
 * Construct ACM URL to verify permission configuration
 */
function getUrlVerifyPermission() {
  return encodeURI(Config.acmProtocol() + "://" + Config.acmHost() + ":" + Config.acmPort() + "/acmserver/api/permissiontypes/" + Config.acmPermissionType());
}
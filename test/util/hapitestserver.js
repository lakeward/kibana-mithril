/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved.
 */

/**
 * Utility class for starting a Hapi test server.
 * This should be written as a class to force instantiation. However, I couldn't figure
 * out how to do that in the available time. For now, you must call the start() method
 * before calling any of the subsequent methods.
 * 
 * @author Lauren Ward
 *
 */

const Hapi = require("hapi");
const Request = require("request");

const AuthPlugin = require("../../index");
const Acm = require("../../src/authentication/acm");

const PORT = 5810;
const HOST = "127.0.0.1";
const PROTOCOL = "http";
const URL = PROTOCOL + "://" + HOST + ":" + PORT;

let server = undefined;
let acmToken = undefined;

module.exports = {
  start: async () => {
    server = new Hapi.Server({
      host: HOST,
      port: PORT
    });

    let plugin = AuthPlugin({
      Plugin: class {
        constructor(plugin) {
          this.init = plugin.init;
        }
      }
    });

    server.config = () => {
      return {
        get: key => {
          return "";
        }
      };
    };

    await plugin.init(server, {});
    await server.start();
    acmToken = await Acm.authenticate("acm-admin", "secret");
  },
  
  stop: async () => {
    await server.stop();
  },

  url: path => {
    return URL + path;
  },

  getAcmToken: token => {
    return acmToken;
  },

  getAcmCookieEntry: () => {
    return "acmToken=" + acmToken.token;
  }, 

  getRequest: async () => {
    Request.get({
      uri: module.exports.url("/corena"),
      headers: {
        Cookie: module.exports.getAcmToken(acmToken)
      }
    }).on("response", response => {
      return response.request;
    });
  }
};

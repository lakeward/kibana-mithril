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
const Config = require("../../src/config");

const PORT = 5810;
const HOST = "127.0.0.1";
const PROTOCOL = "http";
const URL = PROTOCOL + "://" + HOST + ":" + PORT;
const ACM_USERNAME = "acm-admin";
const ACM_PASSWORD = "secret";
const INSIGHT_USERNAME = "admin@app.insight.com";
const INSIGHT_PASSWORD = "admin";


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
    acmToken = await Acm.authenticate(ACM_USERNAME, ACM_PASSWORD);
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
    return Config.acmTokenName() +"=" + acmToken.token;
  },

  getAcmUserName: () => {
    return ACM_USERNAME;
  },

  getAcmPassword: () => {
    return ACM_PASSWORD;
  },

  getInsightUserName: () => {
    return INSIGHT_USERNAME;
  },

  getInsightPassword: () => {
    return INSIGHT_PASSWORD;
  },

  getInsightCookieEntry: (token) => {
    return Config.getInsightCookieEntry() + "=" + token;
  },
  
  getRequest: async () => {
    return new Promise((resolve, reject) => {
      Request.get({
        uri: module.exports.url("/corena/test"),
        headers: {
          Cookie: module.exports.getAcmToken(acmToken)
        }
      }).on("response", response => {
        return resolve(response.request);
      });
    });
  },
  
  getMockHandler: () => {
    return {
      tokenName: undefined,
      token: undefined,
      config: undefined,
      state: function(tokenName, token, config) {
        this.tokenName = tokenName;
        this.token = token;
        this.config = config;
      }
    };
  }


};

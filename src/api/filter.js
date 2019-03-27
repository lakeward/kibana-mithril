/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved.
 */

/**
 *
 * Adds proxying and filtering to an existing Hapi server
 * in order to be able to modify requests based on
 * authorization before they are routed.
 *
 * This implementation is still in an experimental mode.
 *
 * @author Robin Duda
 * @author Lauren Ward
 */

const Querystring = require("querystring");
const Express = require("express");
const Proxy = require("express-http-proxy");

const Auth = require("../authentication/auth");
const Config = require("../config");
const Logger = require("../logger");

let app = Express();

module.exports = {
  /**
   * Adds proxying in front of an existing Hapi server.
   * Allows requests to be modified by permissions before
   * they are routed.
   */
  proxy: () => {
    if (Config.proxyEnabled()) {
      app.use(
        "/",
        Proxy(Config.proxyRemote(), {
          filter: (req, res) => {
            return true;
          },
          proxyReqBodyDecorator: (requestBody, request) => {
            if (request.path.startsWith("/elasticsearch/_msearch")) {
              return module.exports.handleSearch(requestBody, request);
            } else {
              return requestBody;
            }
          }
          // forwardPath: req => {
          //     return require('url').parse(req.url).path;
          // }
        })
      );
      app.listen(Config.proxyPort());
    }
  },

  /**
   *
   *
   * @param req the request to be inspected contains user groups and requested index.
   * @returns {Object}
   */
  /**
   * Handles the filtering of a search endpoint in the kibana server API.
   * User group membership are matched against the queried index.
   *
   * @param {Object} requestBody
   * @param {Object} request
   */
  handleSearch: (requestBody, request) => {
    let query = getQueryList(requestBody);
    let authorized = true;
    let response = "";

    try {
      let cookies = getCookies(request);
      let kibanaToken = cookies[Config.tokenName()];
      let authorization = Auth.verifyKibanaToken(kibanaToken);

      for (let i = 0; i < query.length; i++) {
        const queryItem = JSON.parse(query[i]);
        Logger.log(queryItem.index);

        if (
          queryItem.index &&
          !authorizedIndex(queryItem.index, authorization.groups)
        ) {
          authorized = false;
        }

        response += JSON.stringify(queryItem);

        if (i !== query.length - 1) response += "\n";
      }
    } catch (err) {
      Logger.log(err);
      authorized = false;
    }

    // if (authorized) {
    //     reqBody = new Buffer(response);
    // } else {
    //     reqBody = new Buffer('{}');
    // }

    return requestBody;
  },

  /**
   * Checks if a given index is contained within a list of groups.
   *
   * @param index the name of the index.
   * @param groups an array of groups to look in.
   * @returns {boolean}
   */
  authorizedIndex: function(index, groups) {
    return authorizedIndex(index, groups);
  }
};

/**
 * Deconstructs a message that may contain multiple non-joined json
 * query objects, separated by newline.
 *
 * @param content a string representing an unknown number of json objects.
 * @returns Array of strings with one item per json object.
 */
function getQueryList(content) {
  let list = content.toString("utf8").split("\n");

  list = list.filter(item => {
    Logger.log(item.index);
    if (item && item.length > 0 && item.index) {
      Logger.log(item);
      return item;
    }
  });

  if (list.length === 0) {
    return {};
  } else {
    return JSON.stringify(list[0]);
  }
}

function authorizedIndex(index, groups) {
  let authorized = true;
  index = index instanceof Array ? index : [index];

  for (let i = 0; i < index.length; i++) {
    let member = false;

    for (let k = 0; k < groups.length; k++) {
      if (index[i] === groups[k]) member = true;
    }

    if (!member) authorized = false;
  }

  return authorized;
}

function getCookies(request) {
  let list = {};
  let rc = request.headers.cookie;

  rc &&
    rc.split(";").forEach(cookie => {
      var parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });

  return list;
}

/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved.
 */

/**
 * Adds the server API to an existing Hapi server object.
 *
 * @author Robin Duda
 * @author Lauren Ward
 *
 */

const Config = require("../config");
const Auth = require("../authentication/auth");
const KibanaToken = require("../authentication/kibanatoken");
const Logger = require("../logger");

module.exports = {
  /**
   * Adds routing for a Hapi server
   *
   * @param {Object} server Hapi server to register routes on.
   */
  register: async server => {
    let basePath = server.config().get("server.basePath");

    /**
     *  Logout route clears all cookies
     *
     */
    server.route({
      method: "POST",
      path: "/corena/logout",

      handler(request, h) {
        h.unstate(Config.tokenName(), Config.cookie());
        h.unstate(Config.acmTokenName(), Config.cookie());
        return h.response().code(200);
      }
    });

    /**
     * Groups route
     */
    server.route({
      method: "GET",
      path: "/corena/groups",

      handler(request, h) {
        return { groups: request.auth.credentials.groups };
      }
    });

    /**
     * Base query only used for Mocha testing 
     */
    server.route({
      method: "GET",
      path: "/corena/test",
      handler(request, h) {
        return h.response().code(200);
      }
    });

    /**
     * CORENA authentication scheme that requires an acmToken or ACTIVITI_REMEMBER_ME token.
     * If either token exists, schema validates the token and generates Kibana token which is used for
     * all other requests during the session.
     */
    server.auth.scheme("corena", (server, options) => {
      return {
        authenticate: async (request, h) => {
          try {
            if (Config.authScheme() === "acm") {

              let hasKibanaToken = await Auth.hasKibanaToken(request);
              let hasAcmToken = await Auth.hasAuthToken(request);
            
              if (hasKibanaToken && hasAcmToken) {
                
                let credentials = await server.auth.test("jwt", request);
                return h.authenticated({ credentials: credentials });

              } else if (hasAcmToken) {
                
                // Generate kibanaToken based on acmToken
                await Auth.verifyAuthToken(request);
                await Auth.verifyAuthPermissions(request);
                await Auth.setKibanaToken(request, h);
            
                let credentials = await server.auth.test("jwt", request);
                return h.authenticated({ credentials: credentials });

              } else {
                throw new Error(
                  `acmToken required to authenticate with authScheme='${Config.authScheme()}'`
                );
              }
            } else if (Config.authScheme() === "kibana") {
              // Enable use of kibana without authentication if desired              
              await Auth.setKibanaToken(request, h);
              let credentials = await server.auth.test("jwt", request);
              return h.authenticated({ credentials: credentials });
            } else {
              throw new Error(
                `Unsupported authScheme='${Config.authScheme()}'`
              );
            }

          } catch (e) {
            Logger.log(e);
            h.unstate(Config.tokenName(), Config.cookie());
            h.unstate(Config.acmTokenName(), Config.cookie());

            if (Config.authScheme() === "acm") {
              return h.redirect(Config.acmRedirectUrl()).takeover();
            } else if (Config.authScheme() === "insight") {
              return h.redirect(Config.insightRedirectUrl()).takeover();
            } else {
              return h.redirect(`${basePath}/corena`).takeover();
            }
          }
        }
      };
    });

    // JWT is used to provide authorization through JWT-cookies.
    try {
      await server.register(require("hapi-auth-jwt2"));

      // needs to be registered so we can reference it from our custom strategy.
      server.auth.strategy("jwt", "jwt", {
        key: KibanaToken.secret(),
        validate: validate,
        verifyOptions: { algorithms: ["HS256"] },
        cookieKey: Config.tokenName()
      });

      server.auth.strategy("corena", "corena", {});

      // hack to override the default strategy that is already set by x-pack.
      server.auth.settings.default = null;

      server.auth.default("corena");

    } catch (err) {
      throw err;
    }
  }
};

/**
 * Validates that the token has not expired
 *
 * @param token JWT token carried in a cookie.
 * @param h Handler
 */
function validate(token, h) {
  let valid = new Date().getTime() < token.expiry;
  return { isValid: valid };
}

/**
 * Grabs the remote IP of the client, supports extracting the
 * X-Forwarded-For header but always includes both the header value
 * and the proxy's IP address (to prevent spoofing the logs).
 */
function source(request) {
  return {
    ip: request.info.remoteAddress,
    forwarded: request.headers["x-forwarded-for"]
  };
}

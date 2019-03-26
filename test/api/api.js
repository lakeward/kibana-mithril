/**
 * @author Robin Duda
 *
 * Tests routing added by the Server API.
 */

const Assert = require("assert");
const Hapi = require("hapi");
const Request = require("request");

const API = require("../../src/api/api");
const index = require("../../index");
const Auth = require("../../src/authentication/auth");
const Acm = require("../../src/authentication/acm");

const PORT = 5810;

let server = undefined;
let acmToken = undefined;
let request = undefined;

function url(resource) {
  return "http://127.0.0.1:" + PORT + resource;
}

function getAcmToken(token) {
  return "acmToken=" + token.token;
}

describe("Server API Routing", () => {
  before(async () => {
    server = new Hapi.Server({
      host: "127.0.0.1",
      port: PORT
    });

    let plugin = index({
      Plugin: class {
        constructor(plugin) {
          this.init = plugin.init;
        }
      }
    });

    // decorated by kibana.
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
  });

  after(async () => {
    await server.stop();
  });

  it("Logout requires a valid token.", done => {
    Request.cookie("");

    Request.post({
      uri: url("/corena/logout"),
      headers: {
        Cookie: getAcmToken(acmToken)
      }
    }).on("response", response => {
      Assert.equal(response.statusCode, 200);
      done();
    });
  });

  it("Should redirect with 302 on authentication missing.", done => {
    Request.post({
      uri: url("/corena/logout"),
      headers: {
        Cookie: ""
      }
    }).on("response", response => {
      Assert.equal(response.statusCode, 302);
      done();
    });
  });

  it("Should return group membership.", done => {
    Request.get({
      uri: url("/corena/groups"),
      headers: {
        Cookie: getAcmToken(acmToken)
      }
    })
      .on("response", response => {
        Assert.equal(response.statusCode, 200);
      })
      .on("data", data => {
        Assert.equal(
          data.toString(),
          '{"groups":["Acmadministrators","ACM","DM","PP"]}'
        );
        done();
      });
  });
});

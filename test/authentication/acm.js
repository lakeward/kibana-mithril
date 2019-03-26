/**
 * @author Robin Duda
 *
 * Tests routing added by the Server API.
 */

const Assert = require("assert");
const Hapi = require("hapi");
const Request = require("request");
const Expect = require("expect.js");

const index = require("../../index");
const Config = require("../../src/config");
const Acm = require("../../src/authentication/acm");
const Logger = require("../../src/logger");

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

describe("ACM Utilities", () => {
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

  it("Generating request object.", done => {
    Request.get({
      uri: url("/corena"),
      headers: {
        Cookie: getAcmToken(acmToken)
      }
    }).on("response", response => {
      request = response.request;
      Assert.equal(response.statusCode, 200);
      done();
    });
  });

  it("Request has ACM token", async () => {
    request.state = { acmToken: acmToken };
    let hasToken = await Acm.hasToken(request);
    Assert.equal(true,hasToken);
  });

  it("ACM should create ACM token", async () => {
    let acmToken = await Acm.authenticate("acm-admin", "secret");
    Assert.notEqual(acmToken.token, undefined);
  });

  it("ACM should throw Unauthorized error", async () => {
    try {
      let acmToken = await Acm.authenticate("acm-admin", "secret2");
    } catch (e) {
      Expect(e.message).to.equal(
        "Unable to authenticate; ACM returned error 'Unauthorized'"
      );
    }
  });
});

/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved.
 */

/**
 * Tests ACM calls
 *
 * @author Lauren Ward
 *
 */

const Assert = require("assert");
const Hapi = require("hapi");
const Request = require("request");

const HapiTestServer = require("../../test/util/hapitestserver.js");
const Acm = require("../../src/authentication/acm");
const Config = require("../../src/config");
const Logger = require("../../src/logger");

describe("ACM Utilities", () => {
  before(async () => {
    await HapiTestServer.start();
  });

  after(async () => {
    await HapiTestServer.stop();
  });

  it("ACM: Has acmToken in request", async () => {
    let request = await HapiTestServer.getRequest();
    request.state = { acmToken: HapiTestServer.getAcmToken() };
    let hasToken = await Acm.hasToken(request);
    Assert.equal(hasToken, true);
  });

  it("ACM: Valid authentication request", async () => {
    let acmToken = await Acm.authenticate(HapiTestServer.getAcmUserName(), HapiTestServer.getAcmPassword());
    Assert.notEqual(acmToken.token, undefined);
  });

  it("ACM: Invalid authentication request", async () => {
    try {
      let acmToken = await Acm.authenticate(HapiTestServer.getAcmUserName(), "secret2");
    } catch (e) {
      Assert.equal(e.message,
        "Unable to authenticate; ACM returned error 'Unauthorized'"
      );
    }
  });

  it("ACM: Verify valid acmToken in request", async () => {
    let request = await HapiTestServer.getRequest();

    request.state = {};
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;

    let verifiedToken = await Acm.verifyToken(request);

    Assert.equal(verifiedToken, true);
  });

  it("ACM: Get acmToken from request.", async () => {
    let request = await HapiTestServer.getRequest();

    request.state = {};
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;

    let verifiedToken = await Acm.getToken(request);

    Assert.notEqual(verifiedToken, null);
  });

  it("ACM: Verify ACM permissions from request.", async () => {
    let request = await HapiTestServer.getRequest();

    request.state = {};
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;

    let verifiedPermissions = await Acm.verifyPermissions(request);
    
    Assert.equal(verifiedPermissions, true);
  });

  it("ACM: set kibanaToken on request.", async () => {
    let request = await HapiTestServer.getRequest();
    let handler = HapiTestServer.getMockHandler();

    request.state = {};
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;

    let verifiedToken = await Acm.setKibanaToken(request, handler);

    Assert.notEqual(handler.tokenName, null);
    Assert.notEqual(handler.token,null);
  });
});

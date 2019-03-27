/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved.
 */

/**
 * Tests Auth calls
 * 
 * @author Lauren Ward
 *
 */

const Assert = require("assert");
const Hapi = require("hapi");
const Request = require("request");

const HapiTestServer = require("../util/hapitestserver.js");
const Auth = require("../../src/authentication/auth");
const Config = require("../../src/config");
const Logger = require("../../src/logger");

describe("Auth Utilities", () => {
  before(async () => {
    await HapiTestServer.start();
  });

  after(async () => {
    await HapiTestServer.stop();
  });

  it("Auth: Has acmToken in request", async () => {
    let request = await HapiTestServer.getRequest();
    request.state = { };
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;
    let hasToken = await Auth.hasAuthToken(request);
    Assert.equal(hasToken, true);
  });

  it("Auth: Has acmToken in request", async () => {
    let request = await HapiTestServer.getRequest();
    request.state = { };
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;
    let hasToken = await Auth.hasAuthToken(request);
    Assert.equal(hasToken, true);
  });

  it("Auth: Verify valid acmToken in request", async () => {
    let request = await HapiTestServer.getRequest();
    request.state = { };
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;
    let verifiedToken = await Auth.verifyAuthToken(request);
    Assert.equal(verifiedToken, true);
  });

  it("Auth: Get acmToken from request.", async () => {
    let request = await HapiTestServer.getRequest();
    request.state = { };
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;
    let verifiedToken = await Auth.getAuthToken(request);
    Assert.notEqual(verifiedToken, null);
  });

  it("Auth: Verify ACM permissions from request.", async () => {
    let request = await HapiTestServer.getRequest();
    request.state = { };
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;
    let verifiedPermissions = await Auth.verifyAuthPermissions(request);
    Assert.equal(verifiedPermissions, true);
  });

  it("Auth: Set kibanaToken in request", async () => {
    let request = await HapiTestServer.getRequest();
    let handler = HapiTestServer.getMockHandler();

    request.state = {};
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;

    let verifiedToken = await Auth.setKibanaToken(request, handler);

    Assert.notEqual(handler.tokenName, null);
    Assert.notEqual(handler.token, null);
  });


  it("Auth: Verify kibanaToken", async () => {
    let request = await HapiTestServer.getRequest();
    let handler = HapiTestServer.getMockHandler();

    request.state = {};
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;

    await Auth.setKibanaToken(request, handler);
    let decodeToken = await Auth.verifyKibanaToken(handler.token);

    Assert.equal(decodeToken.id, 'acm-admin');
  });


  it("Auth: Has kibanaToken in request", async () => {
    let request = await HapiTestServer.getRequest();
    let handler = HapiTestServer.getMockHandler();

    request.state = {};
    request.state[Config.acmTokenName()] = HapiTestServer.getAcmToken().token;

     await Auth.setKibanaToken(request, handler);

    request.state[Config.tokenName()] = handler.token;

    let hasToken = await Auth.hasKibanaToken(request);

    Assert.equal(hasToken, true);
  });

});

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

const HapiTestServer = require("../util/hapitestserver.js");
const Insight = require("../../src/authentication/insight");
const Config = require("../../src/config");
const Logger = require("../../src/logger");

describe.skip("Insight Utilities", () => {
  before(async () => {
    await HapiTestServer.start();
  });

  after(async () => {
    await HapiTestServer.stop();
  });

  it("Insight: Has ACTIVITI_REMEMBER_ME in request", async () => {
    let request = await HapiTestServer.getRequest();
    let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), HapiTestServer.getInsightPassword());
    
    request.state = {};
    request.state[Config.insightTokenName()] = insightToken;
    
    let hasToken = await Insight.hasToken(request);
    Assert.equal(hasToken, true);
  });

  it("Insight: Valid authentication request", async () => {
    let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), HapiTestServer.getInsightPassword());
    Assert.notEqual(insightToken, undefined);
  });

  it("Insight: Invalid authentication request", async () => {
    try {
      let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), "secret2");
    } catch (e) {
      Assert.equal(e.message,
        "Unable to authenticate; Insight returned error 'Unauthorized'"
      );
    }
  });

  it("Insight: Verify valid ACTIVITI_REMEMBER_ME in request", async () => {
    let request = await HapiTestServer.getRequest();

    let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), HapiTestServer.getInsightPassword());
    
    request.state = {};
    request.state[Config.insightTokenName()] = insightToken;

    let verifiedToken = await Insight.verifyToken(request);

    Assert.equal(verifiedToken, true);
  });

  it("Insight: Get ACTIVITI_REMEMBER_ME from request.", async () => {
    let request = await HapiTestServer.getRequest();
    let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), HapiTestServer.getInsightPassword());
    
    request.state = {};
    request.state[Config.insightTokenName()] = insightToken;

    let verifiedToken = await Insight.getToken(request);

    Assert.notEqual(verifiedToken, null);
  });

  it("Insight: Verify Insight permissions from request.", async () => {
    let request = await HapiTestServer.getRequest();
    let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), HapiTestServer.getInsightPassword());
    
    request.state = {};
    request.state[Config.insightTokenName()] = insightToken;

    let verifiedPermissions = await Insight.verifyPermissions(request);
    
    Assert.equal(verifiedPermissions, true);
  });

  it("Insight: set kibanaToken on request.", async () => {
    let request = await HapiTestServer.getRequest();
    let handler = HapiTestServer.getMockHandler();

    let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), HapiTestServer.getInsightPassword());
    
    request.state = {};
    request.state[Config.insightTokenName()] = insightToken;

    let verifiedToken = await Insight.setKibanaToken(request, handler);

    Assert.notEqual(handler.tokenName, null);
    Assert.notEqual(handler.token,null);
  });

  it("Insight: get Insight login name", async () => {
    let request = await HapiTestServer.getRequest();
    let handler = HapiTestServer.getMockHandler();

    let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), HapiTestServer.getInsightPassword());
    
    request.state = {};
    request.state[Config.insightTokenName()] = insightToken;

    let loginName = await Insight.getLoginName(request);

    Assert.notEqual(loginName, null);
  });

  it("Insight: get Insight capabilities", async () => {
    let request = await HapiTestServer.getRequest();
    let handler = HapiTestServer.getMockHandler();

    let insightToken = await Insight.authenticate(HapiTestServer.getInsightUserName(), HapiTestServer.getInsightPassword());
    
    request.state = {};
    request.state[Config.insightTokenName()] = insightToken;

    let capabilities = await Insight.getCapabilities(request);

    Assert.notEqual(capabilities.length, undefined);
  });


});

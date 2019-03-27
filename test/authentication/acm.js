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
const Expect = require("expect.js");

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

  it("Request has ACM token", async () => {
    let request = HapiTestServer.getRequest();
    request.state = { acmToken: HapiTestServer.getAcmToken() };
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

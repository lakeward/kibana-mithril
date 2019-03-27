/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved.
 */

/**
 * Tests routing added by the Server API.
 * 
 * @author Lauren Ward
 *
 */

const Assert = require("assert");
const Hapi = require("hapi");
const Request = require("request");

const API = require("../../src/api/api");
const HapiTestServer = require("../../test/util/hapitestserver.js");

describe("Server API Routing", () => {
  before(async () => {
    await HapiTestServer.start();
  });

  after(async () => {
    await HapiTestServer.stop();
  });

  it("Logout requires a valid token.", done => {
    Request.cookie("");

    Request.post({
      uri: HapiTestServer.url("/corena/logout"),
      headers: {
        Cookie: HapiTestServer.getAcmCookieEntry(HapiTestServer.getAcmToken())
      }
    }).on("response", response => {
      Assert.equal(response.statusCode, 200);
      done();
    });
  });

  it("Should redirect with 302 on authentication missing.", done => {
    Request.post({
      uri: HapiTestServer.url("/corena/logout"),
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
      uri: HapiTestServer.url("/corena/groups"),
      headers: {
        Cookie: HapiTestServer.getAcmCookieEntry(HapiTestServer.getAcmToken())
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

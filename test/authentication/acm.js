/**
 * @author Robin Duda
 *
 * Tests routing added by the Server API.
 */

const Assert = require("assert");

const Config = require("../../src/config");
const Acm = require("../../src/authentication/auth");

describe("ACM API tests", () => {
  before(async () => {
    await Acm.authenticate("acm-admin", "secret");
  });

  //

  // it('Should deliver the login page on /corena', (done) => {
  //     Request
  //         .get(url('/app/kibana'))
  //         .on('response', (response) => {
  //             Assert.equal(response.statusCode, 200);
  //             done();
  //         });
  // });

  // it('Should accept requests with valid authentication token.', (done) => {
  //     Request.cookie('');

  //     Request
  //         .post({
  //             uri: url('/corena/logout'),
  //             headers: {
  //                 Cookie: "token=" + Authentication.signToken('user', ['group1'])
  //             }
  //         }).on('response', (response) => {
  //             Assert.equal(response.statusCode, 200);
  //             done();
  //     });
  // });

  // it('Should redirect with 302 on authentication invalid.', (done) => {
  //     Request.cookie('');

  //     Request
  //         .post({
  //             uri: url('/corena/logout'),
  //             headers: {
  //                 Cookie: "token=invalid"
  //             }
  //         }).on('response', (response) => {
  //         Assert.equal(response.statusCode, 302);
  //         done();
  //     });
  // });

  // it('Should redirect with 302 on authentication missing.', (done) => {
  //     Request.cookie('');

  //     Request
  //         .post({
  //             uri: url('/corena/logout'),
  //             headers: {
  //                 Cookie: ""
  //             }
  //         }).on('response', (response) => {
  //         Assert.equal(response.statusCode, 302);
  //         done();
  //     });
  // });
});

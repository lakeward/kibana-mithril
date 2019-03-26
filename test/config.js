/**
 * @author Robin Duda
 *
 * Tests the loading and reading of the configuration file.
 */

const Assert = require('assert');
const Config = require('../src/config');

describe('Configuration reader', () => {

    before(() => {
       require('../src/config').reload();
    });

    it('Should read and verify the ACM configuration.', () => {
        const config = require('../src/config').load('acm');

        Assert.notEqual(config, 'Failed to load configuration file.');
        Assert.notEqual(config.host, null);
        Assert.notEqual(config.port, null);
        Assert.notEqual(config.protocol, null);
        Assert.notEqual(config.tokenName, null);
        Assert.notEqual(config.acmPermissionType, null);
        Assert.notEqual(config.redirectUrl, null);

        Assert.notEqual(Config.acmHost(), null);
        Assert.notEqual(Config.acmPort(), null);
        Assert.notEqual(Config.acmProtocol(), null);
        Assert.notEqual(Config.acmRedirectUrl(), null);
        Assert.notEqual(Config.acmTokenName(), null);
        Assert.notEqual(Config.acmPermissionType(), null);

    });

    it('Should read and verify the Login/Cookie configuration.', () => {
        const config = require('../src/config').load('authentication');

        Assert.notEqual(config.kbnVersion, null);
        Assert.notEqual(config.tokenName, null);
        Assert.notEqual(config.cookie, null);
        Assert.equal(config.cookie.ttl, null);
        Assert.notEqual(config.cookie.path, null);
        Assert.notEqual(config.cookie.encoding, null);
        Assert.notEqual(config.cookie.isHttpOnly, null);
        Assert.notEqual(config.cookie.clearInvalid, null);
        Assert.notEqual(config.cookie.strictHeader, null);
        Assert.notEqual(config.cookie.domain, null);        
        Assert.notEqual(config.secret, null);
    });


    after(() => {
        // Config.save()
    });

});

/**
 * @author Robin Duda
 *
 * Simple configuration loader, loads the file from disk
 * on inclusion.
 */

const fs = require('fs');

const CONFIG_PATH = require('path').resolve(__dirname, '../config.json');
const PACKAGE_PATH = require('path').resolve(__dirname, '../package.json');

let config;
let pkg;

function load() {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf-8'));
}

load();

module.exports = {

    /**
     * Returns the configuration for a given section.
     *
     * @param name the section to be returned from the config file..
     */
    load: (name) => {
        return config[name];
    },

    /**
     * Reloads configuration from file.
     */
    reload: () => {
      load();
    },

    /**
     * Writes the current configuration to disk.
     */
    save: () => {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4));
    },

    get: () => config,
    
    proxyEnabled: () => {
        return config['proxy']['enabled'];
    },

    proxyPort: () => {
        return config['proxy']['port'];
    },

    proxyRemote: () => {
        return config['proxy']['remote'];
    },

    authScheme: () => {
        return config['authScheme'];
    },

    secret: () => {
        return config['authentication']['secret'];
    },

    setSecret: (secret) => {
        config['authentication']['secret'] = secret;
        module.exports.save();
    },

    cookie: () => {
        return config['authentication']['cookie'];
    },

    version: () => {
        return config['authentication']['kbnVersion'];
    },

    pluginVersion: () => {
        return pkg['version'];
    },

    pluginName: () => {
        return pkg['name'];
    },

    tokenName: () => {
        return config['authentication']['tokenName'];
    },

    acmHost: () => {
        return config['acm']['host'];
    },

    acmPort: () => {
        return config['acm']['port'];
    },

    acmProtocol: () => {
        return config['acm']['protocol'];
    },

    acmTokenName: () => {
        return config['acm']['tokenName'];
    },

    acmRedirectUrl: () => {
        return config['acm']['redirectUrl'];
    },

    acmPermissionType: () => {
        return config['acm']['acmPermissionType'];
    },

};

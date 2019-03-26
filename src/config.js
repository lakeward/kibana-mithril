/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved. Flatirons Solutions, Inc.,
 */

/**
 * @author Robin Duda
 * @author Lauren Ward
 *
 * Configuration loader loads file from disk.
 *
 */

const fs = require("fs");

const CONFIG_PATH = require("path").resolve(__dirname, "../config.json");
const PACKAGE_PATH = require("path").resolve(__dirname, "../package.json");

let config;
let pkg;

load();

function load() {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf-8"));
}

module.exports = {
  /**
   * Returns the configuration for a given section.
   *
   * @param name the section to be returned from the config file..
   */
  load: name => {
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

  pluginVersion: () => {
    return pkg["version"];
  },

  pluginName: () => {
    return pkg["name"];
  },

  authScheme: () => {
    return config["authScheme"];
  },

  acmHost: () => {
    return config["acm"]["host"];
  },

  acmPort: () => {
    return config["acm"]["port"];
  },

  acmProtocol: () => {
    return config["acm"]["protocol"];
  },

  acmTokenName: () => {
    return config["acm"]["tokenName"];
  },

  acmRedirectUrl: () => {
    return config["acm"]["redirectUrl"];
  },

  acmPermissionType: () => {
    return config["acm"]["acmPermissionType"];
  },

  secret: () => {
    return config["authentication"]["secret"];
  },

  setSecret: secret => {
    config["authentication"]["secret"] = secret;
    module.exports.save();
  },

  cookie: () => {
    return config["authentication"]["cookie"];
  },

  version: () => {
    return config["authentication"]["kbnVersion"];
  },

  tokenName: () => {
    return config["authentication"]["tokenName"];
  },

  proxyEnabled: () => {
    return config["proxy"]["enabled"];
  },

  proxyPort: () => {
    return config["proxy"]["port"];
  },

  proxyRemote: () => {
    return config["proxy"]["remote"];
  }
};

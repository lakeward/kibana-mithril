/**
 * @copyright (c) 2019 Flatirons Solutions Inc., All Rights Reserved. Flatirons Solutions, Inc.,
 */

/**
 * Logger utility
 *
 * @author Robin Duda
 * @author Lauren Ward
 *
 */

const config = require("./config");

const ERROR = "error";
const WARNING = "warning";
const INFO = "info";

let plugin = config.pluginName();
let version = config.pluginVersion();
let writer;

module.exports = {
  /**
   * An implementation of a log writer, must have a 'log' method.
   */
  writer: logger => {
    writer = logger;
  },

  /**
   * @param {string} line the text to log.
   * @param {string} level optional - severity of the event, [warning, info, error]
   */
  log: (line, level) => {
    level = level || "info";
    writer.log([level, `plugin:${plugin}@${version}`], line);
  },

  started: () => {
    log("authentication plugin enabled.");
  },

  succeededAuthentication: (user, source) => {
    log(`authentication succeeded for user ${user} from ${ip(source)}`);
  },

  failedAuthentication: (user, source) => {
    log(`authentication failed for user ${user} from ${ip(source)}`, WARNING);
  },

  unauthorized: (path, source) => {
    log(`blocked unauthorized access to ${path} from ${ip(source)}`);
  },

  generatedSecret: () => {
    log(`generated random secret for signing tokens.`);
  }
};

function ip(source) {
  return source.forwarded
    ? `[${source.forwaraded}, ${source.ip}]`
    : `[${source.ip}]`;
}

function log(line, level) {
  module.exports.log(line, level);
}

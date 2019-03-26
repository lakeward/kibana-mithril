/**
 * @author Robin Duda
 *
 * Kibana 6 LDAP authentication plugin for multi-user mode.
 *
 * Requires all routes to carry a valid JWT token as a cookie
 * or be redirected to a login page. A filter and proxy is
 * added to the Kibana Hapi server to ensure query permissions
 * on indices and to hijack queries for stored dashboards/queries/graphs
 * so that the request may be processed in a context-aware manner.
 */

const Filter = require('./src/api/filter');
const API = require('./src/api/api');
const Config = require('./src/config').load('authentication');
const Logger = require('./src/logger');

require('./src/authentication/auth');


module.exports = function (kibana) {
    return new kibana.Plugin({
        name: 'kibana-corena-authorization',
        require: [],
        uiExports: {
            app: {
                title: 'Mithril',
                description: 'Mithril authentication plugin.',
                main: 'plugins/kibana-corena-authorization/script/app',
                euiIconType: 'securityApp',
                icon: 'plugins/kibana-corena-authorization/img/icon.svg'
            }
        },

        config(Joi) {
            return Joi.object({
                enabled: Joi.boolean().default(true),
            }).default()
        },

        init: async function(server, options) {
            Logger.writer(server);
            Filter.proxy();
            await API.register(server);
            Logger.started();
        }
    });
};
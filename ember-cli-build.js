/* eslint-env node */
const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    dotEnv: {
      clientAllowedKeys: [ 'COUCHDB_HOST' ]
    }
  });
  return app.toTree();
};

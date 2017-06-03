var RSVP = require('rsvp');

module.exports = {
  normalizeEntityName: function() {
  },
  afterInstall: function() {
    return RSVP.all([
      this.addPackageToProject('blob-util', '1.2.1'),
      this.addAddonToProject('ember-network', '^0.3.1')
    ]);
  }
};

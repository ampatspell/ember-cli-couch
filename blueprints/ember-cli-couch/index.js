module.exports = {
  normalizeEntityName: function() {
  },
  afterInstall: function() {
    return this.addAddonToProject('ember-fetch', '3.4.0');
  }
};

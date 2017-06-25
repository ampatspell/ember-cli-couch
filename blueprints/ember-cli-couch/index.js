module.exports = {
  normalizeEntityName: function() {
  },
  afterInstall: function() {
    return this.addAddonToProject('ember-fetch', '3.1.2')
  }
};

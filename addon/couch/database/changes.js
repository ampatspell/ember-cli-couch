import Changes from '../changes/changes';

export default Changes.extend({

  database: null,

  _feedOptions() {
    return {
      url: `${this.get('database.url')}/_changes`,
      qs: {
        include_docs: true
      }
    };
  },

  _feedFactoryName(feed) {
    return `couch:database-changes/feed/${feed}`;
  }

});

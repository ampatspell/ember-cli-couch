import Changes from '../changes/changes';

export default Changes.extend({

  _feedFactoryName(feed) {
    return `couch:database-changes/feed/${feed}`;
  },

});

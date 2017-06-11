import create from '../changes/suspendable-changes';

const Changes = create('view');

export default Changes.extend({

  database: null,

  view: null,

  _feedOptions() {
    let view = this.get('view');
    if(!view) {
      view = undefined;
    }
    let filter;
    if(view) {
      filter = '_view';
    }
    return {
      url: `${this.get('database.url')}/_changes`,
      qs: {
        include_docs: true,
        view,
        filter
      },
    };
  },

  _feedFactoryName(feed) {
    return `couch:database-changes/feed/${feed}`;
  }

});

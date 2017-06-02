import Ember from 'ember';

const {
  merge,
  Logger: { warn }
} = Ember;

export default Ember.Object.extend({

  database: null,

  request(opts) {
    return this.get('database').request(opts);
  },

  reportWarning(warning, opts) {
    warn(`_find:`, warning, opts);
  },

  _query(url, opts) {
    opts = merge({}, opts);
    return this.request({
      method: 'post',
      url: url,
      json: true,
      body: {
        selector:  opts.selector,
        limit:     opts.limit,
        skip:      opts.skip,
        sort:      opts.sort,
        fields:    opts.fields,
        use_index: opts.use_index
      }
    }).then(results => {
      if(results.warning) {
        this.reportWarning(results.warning, opts);
      }
      return results;
    });
  },

  find(opts) {
    return this._query('_find', opts);
  },

  explain(opts) {
    return this._query('_explain', opts);
  },

  //

  save(ddoc, name, index) {
    return this.request({
      method: 'post',
      url: '_index',
      json: true,
      body: {
        ddoc,
        name,
        index
      }
    });
  },

  all() {
    return this.request({
      method: 'get',
      url: '_index',
      json: true
    });
  },

  delete(ddoc, name) {
    return this.request({
      method: 'delete',
      url: `_index/${ddoc}/json/${name}`,
      json: true
    });
  }

});

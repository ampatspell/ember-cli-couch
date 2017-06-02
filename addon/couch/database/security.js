import Ember from 'ember';

export default Ember.Object.extend({

  database: null,

  request(opts={}) {
    opts.url = '_security';
    return this.get('database').request(opts);
  },

  load() {
    return this.request({
      method: 'get',
      json: true
    });
  },

  save(body) {
    return this.request({
      method: 'put',
      json: true,
      body
    });
  }

});

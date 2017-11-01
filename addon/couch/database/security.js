import EmberObject from '@ember/object';

export default EmberObject.extend({

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

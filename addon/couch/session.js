import Ember from 'ember';

const {
  RSVP: { reject }
} = Ember;

export default Ember.Object.extend(Ember.Evented, {

  couch: null,

  request(opts={}) {
    opts.url = '_session';
    return this.get('couch').request(opts);
  },

  load() {
    return this.request({
      method: 'get',
      json: true
    });
  },

  save(name, password) {
    return this.request({
      method: 'post',
      json: true,
      body: {
        name: name || "",
        password: password || ""
      }
    }).then(data => {
      this.trigger('login');
      return data;
    }, err => {
      this.trigger('logout');
      return reject(err);
    });
  },

  delete() {
    return this.request({
      method: 'delete',
      json: true,
    }).then(result => {
      this.trigger('logout');
      return result;
    });
  }

});

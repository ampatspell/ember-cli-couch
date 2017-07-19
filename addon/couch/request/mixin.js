import Ember from 'ember';

const {
  getOwner,
  computed
} = Ember;

const fastboot = () => {
  return computed(function() {
    return getOwner(this).lookup('service:fastboot');
  }).readOnly();
};

let iter = 0;

const cookies = () => {
  return computed('_fastboot', function() {
    let fastboot = getOwner(this).lookup('service:fastboot');
    if(!fastboot) {
      return;
    }
    let cookies = fastboot.get('request.cookies');
    if(!cookies) {
      return;
    }
    let array = [];
    for(let key in cookies) {
      array.push(`${key}=${encodeURIComponent(cookies[key])}`);
    }
    array.push(`ember-cli-fastboot=${iter++}`);
    return array.join('; ');
  }).volatile().readOnly();
};

export default Ember.Mixin.create({

  _request: computed(function() {
    return getOwner(this).factoryFor('couch:request').create();
  }).readOnly(),

  _fastboot: fastboot(),
  _cookies: cookies(),

  request(opts) {
    let cookies = this.get('_cookies');
    if(cookies) {
      opts.headers = opts.headers || {};
      opts.headers.cookie = cookies;
    }
    console.log(opts);
    return this.get('_request').send(opts).then(res => {
      console.log(res);
      return res;
    });
  }

});

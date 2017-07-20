import Ember from 'ember';

const {
  getOwner,
  computed,
  computed: { reads }
} = Ember;

const fastboot = () => {
  return computed(function() {
    return getOwner(this).lookup('service:fastboot');
  }).readOnly();
};

const AuthSession = 'AuthSession';

export default Ember.Mixin.create({

  _request: computed(function() {
    return getOwner(this).factoryFor('couch:request').create();
  }).readOnly(),

  _fastboot: fastboot(),
  _isFastBoot: reads('_fastboot.isFastBoot'),

  _getFastbootRequestCookie() {
    let cookies = this.get('_fastboot.request.cookies');
    if(!cookies) {
      return;
    }
    let cookie = cookies[AuthSession];
    if(!cookie) {
      return;
    }
    return `${AuthSession}=${encodeURIComponent(cookie)}`;
  },

  _setFastbootResponseCookie(cookie) {
    let headers = this.get('_fastboot.response.headers');
    headers.append('set-cookie', cookie);
  },

  _willSendRequest(opts) {
    if(this.get('_isFastBoot')) {
      let cookie = this._getFastbootRequestCookie();
      if(cookie) {
        opts.headers = opts.headers || {};
        opts.headers.cookie = cookie;
      }
    }
    return opts;
  },

  _didReceiveResponse(hash) {
    if(this.get('_isFastBoot')) {
      let res = hash.res;
      let cookie = res.headers.get('set-cookie');
      if(cookie) {
        this._setFastbootResponseCookie(cookie);
      }
    }
    return hash;
  },

  request(opts) {
    opts = this._willSendRequest(opts);
    return this.get('_request').send(opts).then(hash => {
      hash = this._didReceiveResponse(hash);
      if(hash.raw) {
        return hash.res;
      }
      return hash.json;
    });
  }

});

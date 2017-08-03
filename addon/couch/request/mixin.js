import Ember from 'ember';
import isAbsoluteURL from '../../util/is-absolute-url';
import { fastboot } from '../../util/computed';

const {
  getOwner,
  computed,
  computed: { reads }
} = Ember;

const request = () => {
  return computed(function() {
    return getOwner(this).factoryFor('couch:request').create();
  }).readOnly();
};

const isFastBoot = () => {
  return reads('_fastboot.isFastBoot').readOnly();
};

const AuthSession = 'AuthSession';

export default Ember.Mixin.create({

  __request: request(),
  _fastboot: fastboot(),
  _isFastBoot: isFastBoot(),

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
      opts.url = opts.url || '';
      if(!isAbsoluteURL(opts.url)) {
        let request = this.get('_fastboot.request');
        let { protocol, host } = request.getProperties('protocol', 'host');
        opts.url = `${protocol}//${host}${opts.url}`;
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

  _request(opts) {
    opts = this._willSendRequest(opts);
    return this.get('__request').send(opts).then(hash => {
      hash = this._didReceiveResponse(hash);
      if(hash.raw) {
        return hash.res;
      }
      return hash.json;
    });
  },

  request(opts) {
    return this._request(opts);
  }

});

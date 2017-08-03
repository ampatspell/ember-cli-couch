import Ember from 'ember';
import fetch from 'fetch';
import SofaError from '../../util/error';
import composeURL from '../../util/compose-url';
import wrap from '../../util/wrap-promise';
import { next } from '../../util/run';

const {
  RSVP: { reject },
  merge
} = Ember;

const raw = opts => {
  let url = opts.url;
  delete opts.url;
  return wrap(fetch(url, opts));
}

const rejectResponse = resp => {
  return resp.json().then(json => {
    json.status = resp.status;
    return reject(new SofaError(json));
  });
}

const rejectError = err => {
  return reject(new SofaError({ error: 'request', reason: err.message }));
}

const ajax = opts => {
  let json = opts.json;
  delete opts.json;
  return raw(opts).then(res => {
    if(res.status >= 400) {
      return rejectResponse(res);
    }
    if(!json) {
      return { res, raw: true };
    }
    return wrap(res.json()).then(json => ({ res, json, raw: false }));
  }, err => {
    return rejectError(err);
  });
}

const request = opts => {
  opts = opts || {};

  if(!Object.hasOwnProperty(opts, 'json')) {
    opts.json = true;
  }

  opts.url = composeURL(opts.url, opts.qs);

  if(opts.json === true) {
    opts.headers = merge({
      'Content-Type': 'application/json',
      'Accept':       'application/json'
    }, opts.headers);
    opts.body = JSON.stringify(opts.body);
  }

  delete opts.qs;

  opts.mode = 'cors';
  opts.cache = 'default';
  opts.credentials = 'include';

  return ajax(opts);
}

export default Ember.Object.extend({

  send(opts) {
    return request(opts).then(result => next().then(() => result));
  }

});

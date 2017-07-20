import Ember from 'ember';
import SofaError from '../../util/error';
import { next } from '../../util/run';
import fetch from 'fetch';

const {
  isNone,
  RSVP: { resolve, reject },
  merge,
  A
} = Ember;

function wrap(promise) {
  return resolve(promise).then(res => resolve(res), err => reject(err));
}

function raw(opts) {
  let url = opts.url;
  delete opts.url;
  return wrap(fetch(url, opts));
}

function rejectResponse(resp) {
  return resp.json().then(json => {
    json.status = resp.status;
    return reject(new SofaError(json));
  });
}

function rejectError(err) {
  return reject(new SofaError({ error: 'request', reason: err.message }));
}

function ajax(opts) {
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

function objectToQueryString(obj) {
  if(!obj) {
    return;
  }
  let pairs = A();
  for(let key in obj) {
    let value = obj[key];
    if(!isNone(value)) {
      pairs.push([key, encodeURIComponent(value)].join('='));
    }
  }
  return pairs.join('&');
}

export function composeURL(url, qs) {
  qs = objectToQueryString(qs);
  if(qs) {
    return `${url}?${qs}`;
  }
  return url;
}

export function request(opts) {
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

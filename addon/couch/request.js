import Ember from 'ember';
import SofaError from '../util/error';
import { next } from '../util/run';
import fetch from "ember-network/fetch";

const {
  isNone,
  RSVP: { reject },
  merge,
  A
} = Ember;

function raw(opts) {
  let url = opts.url;
  delete opts.url;
  return fetch(url, opts);
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
  return raw(opts).then(resp => {
    if(resp.status >= 400) {
      return rejectResponse(resp);
    }
    if(!json) {
      return resp;
    }
    return resp.json();
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

function composeURL(url, qs) {
  qs = objectToQueryString(qs);
  if(qs) {
    return `${url}?${qs}`;
  }
  return url;
}

export function request(opts) {
  opts = opts || {};

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
    return request(opts).then(result => {
      return next().then(() => result);
    });
  }

});

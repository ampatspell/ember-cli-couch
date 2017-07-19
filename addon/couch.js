import Ember from 'ember';
import { object } from './util/computed';
import { destroyObject } from './util/destroy';
import Changes from './couch/changes/mixin';
import Request from './couch/request/mixin';

const {
  computed,
  getOwner
} = Ember;

const normalizedUrl = () => {
  return computed('url', function() {
    let url = this.get('url');
    if(!url) {
      return url;
    }
    if(!url.endsWith('/')) {
      url = `${url}/`;
    }
    return url;
  }).readOnly();
};

const session = () => {
  return computed(function() {
    return getOwner(this).factoryFor('couch:session').create({ couch: this });
  }).readOnly();
};

export default Ember.Object.extend(
  Changes,
  Request, {

  couches: null,
  url: null,

  normalizedUrl: normalizedUrl(),

  openDatabases: object(),

  session: session(),

  request(opts) {
    let url = this.get("normalizedUrl");
    opts = opts || {};
    opts.url = opts.url ? [url, opts.url].join('') : url;
    return this._super(opts);
  },

  info() {
    return this.request({
      type: 'get',
      json: true
    });
  },

  uuids(count) {
    return this.request({
      type: 'get',
      url: '_uuids',
      qs: {
        count: count || 1
      },
      json: true
    });
  },

  createDatabase(name) {
    let couch = this;
    return getOwner(this).factoryFor('couch:database').create({ couch, name });
  },

  database(name) {
    let dbs = this.get('openDatabases');
    let db = dbs[name];
    if(!db) {
      db = this.createDatabase(name);
      dbs[name] = db;
    }
    return db;
  },

  db: computed(function() {
    let couch = this;
    return getOwner(this).factoryFor('couch:databases').create({ couch });
  }).readOnly(),

  _destroyRequest() {
    this.get('_request').destroy();
  },

  _destroyOpenDatabases() {
    destroyObject(this.get('openDatabases'));
  },

  _destroySession() {
    this.get('session').destroy();
  },

  createChanges(opts) {
    return getOwner(this).factoryFor('couch:couch-changes').create({ couch: this, opts });
  },

  willDestroy() {
    this._destroyRequest();
    this._destroyOpenDatabases();
    this._destroySession();
    this._super();
  },

  toStringExtension() {
    return this.get('normalizedUrl');
  }


});

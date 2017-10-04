import Ember from 'ember';
import { module as qmodule, skip } from 'qunit';
import { test as qtest, only as qonly } from 'ember-qunit';
import startApp from './start-app';
import extendAssert from './extend-assert';
import environment from '../../config/environment';

const host = environment.APP.COUCHDB_HOST;

const {
  RSVP: { Promise, resolve, reject, all },
  Logger: { info, error },
  run,
  merge
} = Ember;

const configs = {
  '1.6': {
    url: `${host}:6016`,
    name: 'ember-cli-couch',
    feed: 'event-source'
  },
  '2.0': {
    url: `${host}:6020`,
    name: 'ember-cli-couch',
    feed: 'long-polling'
  }
};

export const admin = {
  name: 'admin',
  password: 'hello'
};

const _catch = err => {
  error(err);
  error(err.stack);
  return reject(err);
};

const makeModule = (name, cb, config, state) => {
  qmodule(name, {
    beforeEach(assert) {
      window.currentTestName = `${name}: ${assert.test.testName}`;
      info(`→ ${window.currentTestName}`);
      let done = assert.async();
      state.start(config).then(() => cb()).catch(_catch).finally(() => done());
    },
    afterEach(assert) {
      let done = assert.async();
      state.destroy().catch(_catch).finally(() => done());
    },
  });
}

class State {
  constructor() {
    this.keys = [];
  }
  start(config) {
    this.application = startApp();
    this.instance = this.application.buildInstance();
    return this.once(config);
  }
  _createSystemDatabases(config) {
    let couch = this.couch(config.url);
    let dbs = [ '_global_changes', '_metadata', '_replicator', '_users' ];
    return resolve()
      .then(() => couch.get('session').save(admin.name, admin.password))
      .then(() => all(dbs.map(name => couch.database(name).get('database').create({ optional: true }))));
  }
  _once(config) {
    if(config.key === '2.0') {
      return this._createSystemDatabases(config);
    }
    return resolve();
  }
  once(config) {
    let { key } = config;
    if(this.keys.includes(key)) {
      return resolve();
    }
    this.keys.push(key);
    return this._once(config);
  }
  destroy() {
    return next().then(() => {
      if(this._couches) {
        this._couches.destroy();
        this._couches = null;
      }
    }).then(() => {
      this.instance.destroy();
      this.instance = null;
      this.application.destroy();
      this.application = null;
    });
  }
  get couches() {
    let couches = this._couches;
    if(!couches) {
      couches = this.instance.factoryFor('couch:couches').create();
      this._couches = couches;
    }
    return couches;
  }
  couch(url) {
    return this.couches.couch({ url });
  }
  createDatabase(url, name) {
    return this.couch(url).database(name);
  }
}

let state = new State();

export function configurations(opts, body) {
  if(typeof opts === 'function') {
    body = opts;
    opts = {};
  }

  let only = opts.only || [];
  if(typeof only === 'string') {
    only = [ only ];
  }

  for(let key in configs) {
    if(only.length > 0 && only.indexOf(key) === -1) {
      continue;
    }
    let config = merge({ key }, configs[key]);
    body({
      config,
      state,
      test,
      module(name, cb) {
        return makeModule(`${name} [${config.key}]`, cb, config, state)
      },
      createDatabase() {
        return state.createDatabase(config.url, config.name);
      }
    });
  }
}

function q(fn, name, cb) {
  return fn(name, assert => {
    extendAssert(assert);
    let done = assert.async();
    resolve().then(() => cb(assert)).catch(err => {
      error(err);
      error(err.stack);
      assert.ok(false, err.stack);
    }).finally(() => done());
  });
}

function test(name, cb) {
  return q(qtest, name, cb);
}

function only(name, cb) {
  return q(qonly, name, cb);
}

test.only = only;
test.skip = skip;

export const next = arg => new Promise(resolve => run.next(() => resolve(arg)));

export const wait = (arg, delay) => new Promise(resolve => run.later(() => resolve(arg), delay));

export const login = db => db.get('couch.session').save(admin.name, admin.password);

export const logout = db => db.get('couch.session').delete();

export const recreate = db => login(db).then(() => db.get('database').recreate({ design: true }));

export const cleanup = (...dbs) => all(dbs.map(db => recreate(db)));

export const waitFor = fn => {
  let start = new Date();
  return new Promise((resolve, reject) => {
    let i = setInterval(() => {
      if(fn()) {
        resolve();
        clearInterval(i);
      } else {
        let now = new Date();
        if(now - start > 20000) {
          reject(new Error('took more than 20 seconds'));
          clearInterval(i);
        }
      }
    }, 50);
  });
}

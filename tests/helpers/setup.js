import Ember from 'ember';
import { module as qmodule, skip } from 'qunit';
import { test as qtest, only as qonly } from 'ember-qunit';
import startApp from './start-app';
import extendAssert from './extend-assert';

const {
  RSVP: { Promise, resolve, reject, all },
  Logger: { info, error },
  run,
  merge
} = Ember;

const configs = {
  '1.6': {
    url: '/api/1.6',
    name: 'ember-cli-couch',
    feed: 'event-source'
  },
  '2.0': {
    url: '/api/2.0',
    name: 'ember-cli-couch',
    feed: 'long-polling'
  }
};

export const admin = {
  name: 'ampatspell',
  password: 'hello'
};

const makeModule = (name, cb, state) => {
  qmodule(name, {
    beforeEach(assert) {
      window.currentTestName = `${name}: ${assert.test.testName}`;
      info(`→ ${window.currentTestName}`);
      let done = assert.async();
      state.start();
      resolve().then(() => cb()).catch(err => {
        error(err);
        error(err.stack);
        return reject(err);
      }).finally(() => done());
    },
    afterEach(assert) {
      let done = assert.async();
      run(() => {
        state.destroy();
        run.next(() => done());
      });
    },
  });
}

class State {
  start() {
    this.application = startApp();
    this.instance = this.application.buildInstance();
  }
  destroy() {
    if(this._couches) {
      this._couches.destroy();
    }
    this.instance.destroy();
    this.application.destroy();
    this.instance = null;
    this.application = null;
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
        return makeModule(`${name} [${config.key}]`, cb, state)
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

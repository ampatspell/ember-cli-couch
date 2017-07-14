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
    this.instance.destroy();
    this.application.destroy();
    this.instance = null;
    this.application = null;
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


// let app;
// let container;
// let destroyables = [];

// export function module(name, cb) {
//   qmodule(name, {
//     beforeEach: function(assert) {
//       window.currentTestName = `${name}: ${assert.test.testName}`;
//       info(`→ ${window.currentTestName}`);
//       let done = assert.async();
//       app = startApp();
//       container = app.__container__;
//       resolve().then(function() {
//         return cb(container);
//       }).then(function() {
//         done();
//       });
//     },
//     afterEach: function(assert) {
//       let done = assert.async();
//       run(() => {
//         destroyables.forEach(item => item.destroy());
//         destroyables = [];
//         app.destroy();
//         run.next(() => {
//           done();
//         });
//       });
//     },
//   });
// }

// export function next(arg) {
//   return new Promise(function(resolve) {
//     run.next(function() {
//       resolve(arg);
//     });
//   });
// }

// export function wait(arg, delay) {
//   return new Promise(function(resolve) {
//     run.later(function() {
//       resolve(arg);
//     }, delay);
//   });
// }

// export function createCouches() {
//   let couches = container.factoryFor('couch:couches').create();
//   destroyables.push(couches);
//   return couches;
// }

// export function createCouch(couches, url) {
//   return couches.couch({ url });
// }

// export function createDatabase(couch, name) {
//   return couch.database(name);
// }

// export function configurations(opts, fn) {
//   if(typeof opts === 'function') {
//     fn = opts;
//     opts = {};
//   }

//   let invoke = (name, url, config) => {
//     fn({
//       module(moduleName, cb) {
//         moduleName = `${moduleName} [${name}]`;
//         return module(moduleName, cb);
//       },
//       test,
//       createDatabase() {
//         return createDatabase(createCouch(createCouches(), config.url), config.name);
//       },
//       config
//     });
//   };

//   let only = opts.only;
//   if(!only) {
//     only = [];
//   } else if(typeof only === 'string') {
//     only = [ only ];
//   }

//   for(let key in configs) {
//     if(only.length > 0 && only.indexOf(key) === -1) {
//       continue;
//     }
//     let value = configs[key];
//     invoke(key, value.url, merge({ key }, value));
//   }
// }

// export function login(db) {
//   return db.get('couch.session').save(admin.name, admin.password);
// }

// export function logout(db) {
//   return db.get('couch.session').delete();
// }

// export function recreate(db) {
//   return login(db).then(() => {
//     return db.get('database').recreate({ design: true });
//   });
// }

// export function cleanup(...dbs) {
//   return all(dbs.map(db => {
//     return recreate(db);
//   }));
// }

// export function waitFor(fn) {
//   let start = new Date();
//   return new Promise((resolve, reject) => {
//     let i = setInterval(() => {
//       if(fn()) {
//         resolve();
//         clearInterval(i);
//       } else {
//         let now = new Date();
//         if(now - start > 20000) {
//           reject(new Error('took more than 20 seconds'));
//           clearInterval(i);
//         }
//       }
//     }, 50);
//   });
// }

export function cleanup() {
};

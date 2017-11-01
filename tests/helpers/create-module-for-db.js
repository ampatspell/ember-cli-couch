import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
import { assert } from '@ember/debug';
import { module } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import environment from '../../config/environment';

const {
  COUCHDB_HOST
} = environment;

const base = {
  'couchdb-1.6': {
    version: '1.6.1',
    couch: {
      url: `${COUCHDB_HOST}:6016`
    },
    feeds: [ 'event-source', 'long-polling', 'continuous' ]
  },
  'couchdb-2.1': {
    version: '2.0.0',
    couch: {
      url: `${COUCHDB_HOST}:6020`
    },
    feeds: [ 'long-polling', 'continuous' ]
  }
};

const admin = {
  name: 'admin',
  password: 'hello'
}

const configs = {};
export const defaultIdentifiers = [];

for(let key in base) {
  let { version, couch, feeds } = base[key];
  let name = 'ember-cli-couch';
  feeds.forEach(feed => {
    let identifier = key;
    let fullIdentifier =`${key}-${feed}`;
    configs[fullIdentifier] = { identifier, version, couch, feed, admin, name };
    if(feeds[0] === feed) {
      defaultIdentifiers.push(fullIdentifier);
    }
  });
}

const defaultConfig = configs['couchdb-1.6-continuous'];

export const availableIdentifiers = Object.keys(configs);

const getter = (object, name, fn) => Object.defineProperty(object, name, { get: () => fn() });

export default identifier => {
  let config = identifier ? configs[identifier] : defaultConfig;
  // if(!config) {
  //   debugger;
  // }
  assert(`config for identifier ${identifier} not found`, !!config);
  return function(name, options={}) {
    let moduleName = name;
    if(identifier) {
      moduleName = `${moduleName} - ${identifier}`;
    }
    module(moduleName, {
      admin(db) {
        db = db || this.db;
        return db.get('couch.session').save('admin', 'hello');
      },
      logout(db) {
        db = db || this.db;
        return db.get('couch.session').delete();
      },
      recreate(db) {
        db = db || this.db;
        return this.admin(db).then(() => db.get('database').recreate({ documents: true, design: true }));
      },
      beforeEach() {
        this.application = startApp();
        this.instance = this.application.buildInstance();
        getter(this, 'couches', () => this.instance.lookup('couch:couches'));
        getter(this, 'couch', () => this.couches.couch(config.couch));
        getter(this, 'db', () => this.couch.database(config.name));
        getter(this,  'config', () => config);
        let beforeEach = options.beforeEach && options.beforeEach.apply(this, arguments);
        return resolve(beforeEach);
      },
      afterEach() {
        let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return resolve(afterEach).then(() => {
          run(() => this.instance.destroy());
          destroyApp(this.application);
        });
      }
    });
  };
}

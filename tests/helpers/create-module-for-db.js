import { module } from 'qunit';
import Ember from 'ember';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import environment from '../../config/environment';

const host = environment.APP.COUCHDB_HOST;

const {
  RSVP: { resolve },
  assert
} = Ember;

const getter = (object, name, fn) => Object.defineProperty(object, name, { get: () => fn() });

const configs = {
  'couchdb-1.6': {
    version: '1.6.1',
    couch: {
      url: `${host}:6016`
    },
    feed: 'event-source'
  },
  'couchdb-2.1': {
    version: '2.0.0',
    couch: {
      url: `${host}:6020`
    },
    feed: 'long-polling'
  }
};

const admin = {
  name: 'admin',
  password: 'hello'
}

for(let key in configs) {
  configs[key].identifier = key;
  configs[key].admin = admin;
}

const defaultConfig = configs['couchdb-1.6'];

export const availableIdentifiers = Object.keys(configs);

export default identifier => {
  let config = identifier ? configs[identifier] : defaultConfig;
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
        getter(this, 'db', () => this.couch.database('ember-cli-couch'));
        getter(this,  'config', () => config);
        let beforeEach = options.beforeEach && options.beforeEach.apply(this, arguments);
        return resolve(beforeEach);
      },
      afterEach() {
        let afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return resolve(afterEach).then(() => {
          Ember.run(() => this.instance.destroy());
          destroyApp(this.application);
        });
      }
    });
  }
}

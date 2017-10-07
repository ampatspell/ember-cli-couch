import Ember from 'ember';
import { registerDatabaseServices } from 'couch';
import environment from '../config/environment';

const {
  COUCHDB_HOST
} = environment;

const {
  Logger: { info }
} = Ember;

export default {
  name: 'dummy:dev',
  initialize(app) {
    registerDatabaseServices(app, {
      db: {
        url: `${COUCHDB_HOST}:6016`,
        name: 'thing'
      }
    });

    app.lookup('service:changes');

    window.db = app.lookup('service:db');
    window.log = info;
  }
};

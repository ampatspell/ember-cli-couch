import Ember from 'ember';
import { registerDatabaseServices } from 'couch';
import environment from '../config/environment';

const host = environment.APP.COUCHDB_HOST;

const {
  Logger: { info }
} = Ember;

export default {
  name: 'dummy:dev',
  initialize(app) {
    registerDatabaseServices(app, {
      db: {
        url: `${host}:6016`,
        name: 'thing'
      }
    });

    app.lookup('service:changes');

    window.db = app.lookup('service:db');
    window.log = info;
  }
};

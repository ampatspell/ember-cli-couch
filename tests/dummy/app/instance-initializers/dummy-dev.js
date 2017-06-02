import Ember from 'ember';
import { registerDatabaseServices } from 'couch';

const {
  Logger: { info }
} = Ember;

export default {
  name: 'dummy:dev',
  initialize(app) {
    registerDatabaseServices(app, {
      db: {
        url: 'http://127.0.0.1:5984',
        name: 'thing'
      }
    });

    window.db = app.lookup('service:db');
    window.log = info;
  }
};

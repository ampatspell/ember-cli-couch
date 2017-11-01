import { registerDatabaseServices } from 'couch';
import environment from '../config/environment';
import { info } from 'couch/util/logger';

const {
  COUCHDB_HOST
} = environment;

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

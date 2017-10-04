import Ember from 'ember';
import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';

const {
  A
} = Ember;

configurations({ identifiers: [ 'couchdb-1.6' ] }, module => {

  let db;

  function protect() {
    return this.admin().then(() => {
      return db.get('security').save({
        admins: {
          names: [],
          roles: []
        },
        members: {
          names: [ this.config.admin.name ],
          roles: []
        }
      });
    }).then(() => {
      return this.logout();
    });
  }

  module('database-changes-forbidden', {
    async beforeEach() {
      db = this.db;
      this.protect = protect;
      await this.recreate();
    }
  });

  test('attempt to listen for changes', function(assert) {
    let data = A();
    return this.protect().then(() => {
      let changes = db.changes({ reconnect: 100 });
      changes.on('data', doc => {
        data.push(doc);
      });
      changes.on('error', err => {
        data.push(err.toJSON());
      });
      changes.start();
      return wait(null, 1000);
    }).then(() => {
      assert.deepEqual(data[0],
        {
          "error": "event source",
          "reason": "unknown"
        }
      );
      return this.admin().then(() => wait(null, 1000));
    }).then(() => {
      data.clear();
      return db.save({ _id: 'foof' }).then(() => wait(null, 1000));
    }).then(() => {
      assert.deepEqual_(data.map(row => row.doc), [
        {
          "_id": "foof",
          "_rev": "ignored"
        }
      ]);
    });
  });

});

import Ember from 'ember';
import { configurations, cleanup, wait, admin, login, logout } from '../helpers/setup';

const {
  A
} = Ember;

configurations({ only: '1.6' }, ({ module, test, createDatabase }) => {

  let db;

  function protect(db) {
    return login(db).then(() => {
      return db.get('security').save({
        admins: {
          names: [],
          roles: []
        },
        members: {
          names: [ admin.name ],
          roles: []
        }
      });
    }).then(() => {
      return logout(db);
    });
  }

  function flush() {
    db = createDatabase();
  }

  module('database-changes-forbidden', () => {
    flush();
    return cleanup(db);
  });

  test('attempt to listen for changes', assert => {
    let data = A();
    return protect(db).then(() => {
      let changes = db.changes({ delay: 100 });
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
      return login(db).then(() => wait(null, 1000));
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

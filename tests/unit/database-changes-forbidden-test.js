import { configurations, cleanup, wait, admin, login, logout } from '../helpers/setup';

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
    let data = [];
    return protect(db).then(() => {
      let changes = db.changes();
      changes.on('data', doc => {
        data.push(doc);
      });
      changes.on('error', err => {
        data.push(err.toJSON());
      });
      changes.start();
      return wait(null, 1000);
    }).then(() => {
      assert.deepEqual(data, [
        {
          "error": "event source",
          "reason": "unknown"
        }
      ]);
    });
  });

});

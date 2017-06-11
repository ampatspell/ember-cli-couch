import { configurations, cleanup, wait, admin, login, logout } from '../helpers/setup';

configurations({ only: '1.6' }, ({ module, test, createDatabase }) => {

  let db;
  let changes;

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
    changes = db.get('changes');
  }

  module('database-changes-forbidden', () => {
    flush();
    return cleanup(db);
  });

  test('attempt to listen for changes', assert => {
    let data = [];
    return protect(db).then(() => {
      changes.set('enabled', true);
      changes.on('data', doc => {
        data.push(doc);
      });
      changes.on('error', err => {
        data.push(err.toJSON());
      });
      changes.on('stopped', () => {
        data.push('stopped');
      });
      return wait(null, 1000);
    }).then(() => {
      assert.equal(changes.get('isOpen'), false);
      assert.deepEqual(data, [
        {
          "error": "unknown",
          "reason": "event source"
        },
        'stopped'
      ]);
    });
  });

});

import { configurations, cleanup, wait } from '../helpers/setup';
import DatabaseChanges from 'couch/couch/database/changes';

configurations({ only: '1.6' }, ({ module, test, createDatabase }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('database-changes-creation', () => {
    flush();
    return cleanup(db);
  });

  test('is created with options', assert => {
    let changes = db.changes();
    assert.ok(changes);
    assert.ok(DatabaseChanges.detectInstance(changes));
    assert.deepEqual(changes.get('opts'), {
      "include_docs": true,
      "feed": "event-source"
    });
  });

  test('can be started', assert => {
    let changes = db.changes();
    let data = [];
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();
    return wait(null, 100).then(() => {
      return db.save({ _id: 'foo', type: 'thing' });
    }).then(json => {
      return db.delete('foo', json.rev);
    }).then(() => {
      return wait(null, 100);
    }).then(() => {
      assert.deepEqual_(data, [
        {
          "_id": "foo",
          "_rev": "ignored",
          "type": "thing"
        },
        {
          "_deleted": true,
          "_id": "foo",
          "_rev": "ignored"
        }
      ]);
    });
  });

});

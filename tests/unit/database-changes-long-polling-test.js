import { configurations, cleanup, wait } from '../helpers/setup';

configurations(({ module, test, createDatabase }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('database-changes-long-polling', () => {
    flush();
    return cleanup(db);
  });

  test('listen for changes', assert => {
    let data = [];
    let changes = db.changes({ feed: 'long-polling' });
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();
    return wait(null, 1000).then(() => {
      return db.save({ _id: 'foo', type: 'thing' });
    }).then(json => {
      return db.delete('foo', json.rev);
    }).then(() => {
      return wait(null, 1000);
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

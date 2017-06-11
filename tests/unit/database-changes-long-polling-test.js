import { configurations, cleanup, wait } from '../helpers/setup';

configurations(({ module, test, createDatabase }) => {

  let db;
  let changes;

  function flush() {
    db = createDatabase();
    changes = db.get('changes');
    changes.set('feed', 'long-polling');
  }

  module('database-changes-long-polling', () => {
    flush();
    return cleanup(db);
  });

  test('listen for changes', assert => {
    let data = [];
    changes.set('enabled', true);
    changes.on('data', doc => {
      data.push(doc);
    });
    return wait().then(() => {
      return db.save({ _id: 'foo', type: 'thing' });
    }).then(json => {
      return db.delete('foo', json.rev);
    }).then(() => {
      return wait();
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

import { configurations, cleanup, wait, waitFor } from '../helpers/setup';

configurations(({ module, test, createDatabase, config }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('database-changes-restart', () => {
    flush();
    return cleanup(db);
  });

  test('can be restarted', assert => {
    let changes = db.changes({ feed: config.feed });
    let data = [];
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();
    let opts;
    return wait(null, 1000).then(() => {
      return db.save({ _id: 'foo' }).then(() => waitFor(() => data.length === 1));
    }).then(() => {
      assert.deepEqual_(data.map(row => row.doc._id), [ 'foo' ]);
      opts = changes.stop();
      assert.ok(opts.since);
      return wait(null, 1000);
    }).then(() => {
      return db.save({ _id: 'bar' }).then(() => wait(null, 1000));
    }).then(() => {
      return changes.start(opts);
    }).then(() => {
      return waitFor(() => data.length === 2);
    }).then(() => {
      assert.deepEqual_(data.map(row => row.doc._id), [ 'foo', 'bar' ]);
      changes.restart();
      return wait(null, 1000);
    }).then(() => {
      return db.save({ _id: 'baz' }).then(() => waitFor(() => data.length === 3));
    }).then(() => {
      assert.deepEqual_(data.map(row => row.doc._id), [ 'foo', 'bar', 'baz' ]);
    });
  });

});

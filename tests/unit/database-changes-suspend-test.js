import { configurations, cleanup, wait } from '../helpers/setup';

configurations(({ module, test, createDatabase, config }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('database-changes-suspend', () => {
    flush();
    return cleanup(db);
  });

  test('listen for changes suspend and resume', assert => {
    let data = [];
    let changes = db.changes({ type: config.feed });
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();

    let resume;
    resume = changes.suspend();

    return wait(null, 1000).then(() => {
      return db.save({ _id: 'one' });
    }).then(() => {
      return db.save({ _id: 'two' });
    }).then(() => {
      assert.deepEqual(data, []);
      resume();
      return wait(null, 500);
    }).then(() => {
      assert.deepEqual(data.map(doc => doc._id), [ 'one', 'two' ]);
      return db.save({ _id: 'three' }).then(() => wait(null, 500));
    }).then(() => {
      assert.deepEqual(data.map(doc => doc._id), [ 'one', 'two', 'three' ]);
    });
  });

});

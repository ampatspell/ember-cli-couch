import { configurations, cleanup, next, wait } from '../helpers/setup';

configurations(({ module, test, createDatabase, config }) => {

  let db;
  let changes;

  function flush() {
    db = createDatabase();
    changes = db.get('changes');
    changes.set('feed', config.feed);
  }

  module('database-changes-suspend', () => {
    flush();
    return cleanup(db);
  });

  test('listen for changes suspend and resume', assert => {
    let data = [];
    changes.set('enabled', true);
    changes.on('data', doc => {
      data.push(doc);
    });

    let resume;
    resume = changes.suspend();

    return wait(null, 1000).then(() => {
      return db.save({ _id: 'one' });
    }).then(() => {
      return db.save({ _id: 'two' });
    }).then(() => {
      assert.deepEqual(data, []);
      resume();
      return next().then(() => next());
    }).then(() => {
      assert.deepEqual(data.map(doc => doc._id), [ 'one', 'two' ]);
      return db.save({ _id: 'three' }).then(() => next()).then(() => next());
    }).then(() => {
      assert.deepEqual(data.map(doc => doc._id), [ 'one', 'two', 'three' ]);
    });
  });

});

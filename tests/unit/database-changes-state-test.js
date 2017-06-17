import { configurations, cleanup } from '../helpers/setup';

configurations({ only: '1.6' }, ({ module, test, createDatabase }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('database-changes-state', () => {
    flush();
    return cleanup(db);
  });

  test('state changes', assert => {
    let changes = db.changes();

    assert.deepEqual(changes.getProperties('isStarted', 'isSuspended'), {
      "isStarted": false,
      "isSuspended": false
    });

    changes.start();

    assert.deepEqual(changes.getProperties('isStarted', 'isSuspended'), {
      "isStarted": true,
      "isSuspended": false
    });

    let resume = changes.suspend();

    assert.deepEqual(changes.getProperties('isStarted', 'isSuspended'), {
      "isStarted": true,
      "isSuspended": true
    });

    resume();

    assert.deepEqual(changes.getProperties('isStarted', 'isSuspended'), {
      "isStarted": true,
      "isSuspended": false
    });

    changes.stop();

    assert.deepEqual(changes.getProperties('isStarted', 'isSuspended'), {
      "isStarted": false,
      "isSuspended": false
    });
  });

});

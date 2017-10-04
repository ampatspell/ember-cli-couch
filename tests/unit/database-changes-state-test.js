import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';

configurations(module => {

  let db;

  module('database-changes-state', {
    async beforeEach() {
      db = this.db;
      await this.recreate();
    }
  });

  test('state changes', function(assert) {
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

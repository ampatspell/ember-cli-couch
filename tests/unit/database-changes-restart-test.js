import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait, waitFor } from '../helpers/run';

configurations(module => {

  let db;
  let feed;

  module('database-changes-restart', {
    async beforeEach() {
      db = this.db;
      feed = this.config.feed;
      await this.recreate();
    }
  });

  test('can be restarted', function(assert) {
    let changes = db.changes({ feed });
    let data = [];
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();
    assert.ok(!changes.get('opts.since'));
    return wait(null, 1000).then(() => {
      return db.save({ _id: 'foo' }).then(() => waitFor(() => data.length === 1));
    }).then(() => {
      assert.deepEqual_(data.map(row => row.doc._id), [ 'foo' ]);
      changes.stop();
      assert.ok(changes.get('opts.since'));
      return wait(null, 1000);
    }).then(() => {
      return db.save({ _id: 'bar' }).then(() => wait(null, 1000));
    }).then(() => {
      return changes.start();
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

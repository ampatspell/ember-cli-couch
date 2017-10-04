import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';

configurations(module => {

  let db;
  let feed;

  module('database-changes-suspend', {
    async beforeEach() {
      feed = this.config.feed;
      db = this.db;
      await this.recreate();
    }
  });

  test('listen for changes suspend and resume', function(assert) {
    let data = [];
    let changes = db.changes({ feed });
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
      assert.deepEqual(data.map(row => row.doc._id), [ 'one', 'two' ]);
      return db.save({ _id: 'three' }).then(() => wait(null, 500));
    }).then(() => {
      assert.deepEqual(data.map(row => row.doc._id), [ 'one', 'two', 'three' ]);
    });
  });

});

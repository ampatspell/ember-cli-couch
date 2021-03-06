import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';
import DatabaseChanges from 'couch/couch/database/changes';

configurations(module => {

  let db;
  let feed;

  module('database-changes-creation', {
    async beforeEach() {
      db = this.db;
      feed = this.config.feed;
      await this.recreate();
    }
  });

  test('is created with options', function(assert) {
    let changes = db.changes();
    assert.ok(changes);
    assert.ok(DatabaseChanges.detectInstance(changes));
    assert.deepEqual(changes.get('opts'), {
      "include_docs": true,
      "feed": [
        "continuous",
        "event-source",
        "long-polling"
      ]
    });
  });

  test('can be started', function(assert) {
    let changes = db.changes({ feed });
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
      assert.deepEqual_(data.map(row => row.doc), [
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

  test('feed default reconnect delay', function(assert) {
    let changes = db.changes({ feed });
    changes.start();
    assert.equal(changes.get('_feed').opts.reconnect, 3000);
  });

  test('feed reconnect delay override', function(assert) {
    let changes = db.changes({ feed, reconnect: 1000 });
    changes.start();
    assert.equal(changes.get('_feed').opts.reconnect, 1000);
  });

});

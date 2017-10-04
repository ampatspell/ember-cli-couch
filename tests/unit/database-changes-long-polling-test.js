import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';

configurations(module => {

  let db;

  module('database-changes-long-polling', {
    async beforeEach() {
      db = this.db;
      await this.recreate();
    }
  });

  test('listen for changes', function(assert) {
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

});

import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';

configurations({ identifiers: [ 'couchdb-1.6-event-source' ] }, module => {

  let db;

  module('database-changes-event-source', {
    async beforeEach() {
      db = this.db;
      await this.recreate();
    }
  });

  test('listen for changes', function(assert) {
    let data = [];
    let changes = db.changes();
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();
    return wait().then(() => {
      return db.save({ _id: 'foo', type: 'thing' });
    }).then(json => {
      return db.delete('foo', json.rev);
    }).then(() => {
      return wait(null, 500);
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

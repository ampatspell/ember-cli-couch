import Ember from 'ember';
import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';

const {
  RSVP: { all }
} = Ember;

configurations(module => {

  let db;
  let feed;

  module('database-changes-view', {
    async beforeEach() {
      db = this.db;
      feed = this.config.feed;
      await this.recreate();
      /* global emit */
      await db.get('design').save('changes', {
        views: {
          'only-things': {
            map(doc) {
              if(doc.type !== 'thing') {
                return;
              }
              emit(doc._id, null);
            }
          }
        }
      });
    }
  });

  test('listen for changes', function(assert) {
    let changes = db.changes({ feed, view: 'changes/only-things', timeout: 2000 });
    let data = [];
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();
    return wait(null, 500).then(() => {
      return all([
        db.save({ _id: 'foo', type: 'thing' }),
        db.save({ _id: 'bar', type: 'duck' })
      ]);
    }).then(([ foo ]) => {
      return db.save({ _id: 'foo', _rev: foo.rev, _deleted: true, type: 'thing' });
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
          "_rev": "ignored",
          "type": "thing"
        }
      ]);

      changes.stop();
      return db.save({ _id: 'thing' });
    });
  });

});

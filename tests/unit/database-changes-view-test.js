import Ember from 'ember';
import { configurations, cleanup, wait } from '../helpers/setup';

const {
  RSVP: { all }
} = Ember;

configurations(({ module, test, createDatabase, config }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('database-changes-view', () => {
    flush();
    /* global emit */
    return cleanup(db).then(() => {
      return db.get('design').save('changes', {
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
    });
  });

  test('listen for changes', assert => {
    let changes = db.changes({ feed: config.feed, view: 'changes/only-things' });
    let data = [];
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();
    return wait(null, 1500).then(() => {
      return all([
        db.save({ _id: 'foo', type: 'thing' }),
        db.save({ _id: 'bar', type: 'duck' })
      ]);
    }).then(([ foo ]) => {
      return db.save({ _id: 'foo', _rev: foo.rev, _deleted: true, type: 'thing' });
    }).then(() => {
      return wait(null, 1500);
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
    });
  });

});

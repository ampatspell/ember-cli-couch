import Ember from 'ember';
import { configurations, cleanup, wait } from '../helpers/setup';

const {
  RSVP: { all }
} = Ember;

configurations(({ module, test, createDatabase, config }) => {

  let db;
  let changes;

  function flush() {
    db = createDatabase();
    changes = db.get('changes');
    changes.set('feed', config.feed);
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
    let data = [];
    changes.setProperties({
      view: 'changes/only-things',
      enabled: true
    });
    changes.on('data', doc => {
      data.push(doc);
    });
    return wait(null, 1000).then(() => {
      return all([
        db.save({ _id: 'foo', type: 'thing' }),
        db.save({ _id: 'bar', type: 'duck' })
      ]);
    }).then(([ foo ]) => {
      return db.save({ _id: 'foo', _rev: foo.rev, _deleted: true, type: 'thing' });
    }).then(() => {
      return wait(null, 3000);
    }).then(() => {
      assert.deepEqual_(data, [
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

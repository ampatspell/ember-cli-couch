import { configurations, cleanup, wait } from '../helpers/setup';
import Listener from 'couch/couch/database/changes/event-source';

configurations({ only: '1.6' }, ({ module, test, createDatabase }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('event-source', () => {
    flush();
    return cleanup(db);
  });

  test('listen save and delete', assert => {
    let listener = new Listener(`${db.get('url')}/_changes?feed=eventsource&include_docs=true&since=now`);
    let data = [];
    listener.delegate = {
      onData(listener_, json) {
        assert.ok(listener_ === listener);
        data.push(json);
      }
    };
    listener.start();
    assert.equal(listener.started, true);
    return wait().then(() => {
      return db.save({ _id: 'foo', type: 'thing' });
    }).then(json => {
      return db.delete('foo', json.rev);
    }).then(() => {
      return wait();
    }).then(() => {
      assert.equal(listener.open, true);
      listener.stop();
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

import { configurations, cleanup, wait, login, logout, admin } from '../helpers/setup';
import Listener from 'couch/couch/database/changes/long-polling';

configurations(({ module, test, createDatabase }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  function protect(db) {
    return login(db).then(() => {
      return db.get('security').save({
        admins: {
          names: [],
          roles: []
        },
        members: {
          names: [ admin.name ],
          roles: []
        }
      });
    }).then(() => {
      return logout(db);
    });
  }

  module('long-polling', () => {
    flush();
    return cleanup(db).then(() => {
      return logout(db);
    });
  });

  test('listen save and delete', assert => {
    let listener = new Listener(`${db.get('url')}/_changes?feed=longpoll&include_docs=true&since=now`);
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

  test('listen protected database', assert => {
    let listener;
    let events = [];
    return protect(db).then(() => {
      listener = new Listener(`${db.get('url')}/_changes?feed=longpoll&include_docs=true&since=now`);
      listener.delegate = {
        onData(listener_, json) {
          events.push({ type: 'data', json });
        },
        onError(listener_, err) {
          events.push({ type: 'error', err: err.toJSON() });
        }
      };
      listener.start();
      assert.equal(listener.started, true);
      assert.equal(listener.open, true);
      return wait(null, 3000);
    }).then(() => {
      assert.equal(listener.started, true);
      assert.equal(listener.open, false);
      assert.deepEqual(events, [
        {
          type: 'error',
          err: {
            "error": "unauthorized",
            "reason": "You are not authorized to access this db.",
            "status": 401
          },
        }
      ]);
    }).finally(() => {
      listener.stop();
    });
  });

});

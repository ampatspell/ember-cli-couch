import { configurations, cleanup, wait, login, logout, admin } from '../helpers/setup';
import Feed from 'couch/couch/changes/feed/unified/long-polling';

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

  module('changes-source-long-polling', () => {
    flush();
    return cleanup(db);
  });

  test('listen save and delete', assert => {
    let source = new Feed({
      url: `${db.get('url')}/_changes`,
      qs: {
        include_docs: true
      }
    });
    let data = [];
    source.delegate = {
      onData(source_, json) {
        assert.ok(source_ === source);
        data.push(json);
      }
    };
    source.start();
    return wait(null, 1000).then(() => {
      return db.save({ _id: 'foo', type: 'thing' });
    }).then(json => {
      return db.delete('foo', json.rev);
    }).then(() => {
      return wait(null, 1000);
    }).then(() => {
      source.stop();
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
    let source;
    let events = [];
    return protect(db).then(() => {
      source = new Feed({
        url: `${db.get('url')}/_changes`,
        qs: {
          include_docs: true
        }
      });
      source.delegate = {
        onData(source_, json) {
          events.push({ type: 'data', json });
        },
        onError(listener_, err) {
          events.push({ type: 'error', err: err.toJSON() });
        }
      };
      source.start();
      return wait(null, 100);
    }).then(() => {
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
      source.stop();
    });
  });

});

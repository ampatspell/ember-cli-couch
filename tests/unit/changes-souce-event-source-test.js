import { configurations, cleanup, wait, login, logout, admin } from '../helpers/setup';
import Feed from 'couch/couch/changes/feed/event-source';

configurations({ only: '1.6' }, ({ module, test, createDatabase }) => {

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

  module('changes-source-event-source', () => {
    flush();
    return cleanup(db);
  });

  test('listen save and delete', assert => {
    let source = new Feed({
      url: `${db.get('url')}/_changes`,
      qs: {
        include_docs: true,
        since: 'now'
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
    assert.equal(source.started, true);
    return wait().then(() => {
      return db.save({ _id: 'foo', type: 'thing' });
    }).then(json => {
      return db.delete('foo', json.rev);
    }).then(() => {
      return wait(null, 1000);
    }).then(() => {
      assert.equal(source.open, true);
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
          include_docs: true,
          since: 'now'
        }
      });
      source.delegate = {
        onData(source_, json) {
          events.push({ type: 'data', json });
        },
        onError(source_, err) {
          events.push({ type: 'error', err: err.toJSON() });
        }
      };
      source.start();
      assert.equal(source.started, true);
      assert.equal(source.open, false);
      return wait(null, 1000);
    }).then(() => {
      assert.equal(source.started, false);
      assert.equal(source.open, false);
      assert.deepEqual(events, [
        {
          type: 'error',
          err: {
            error: 'unknown',
            reason: 'event source'
          }
        }
      ]);
    }).finally(() => {
      source.stop();
    });
  });

});

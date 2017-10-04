import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';
import Feed from 'couch/couch/changes/feed/unified/long-polling';

configurations(module => {

  let db;
  let ctx;

  function protect() {
    return this.admin().then(() => {
      return this.db.get('security').save({
        admins: {
          names: [],
          roles: []
        },
        members: {
          names: [ this.config.admin.name ],
          roles: []
        }
      });
    }).then(() => {
      return this.logout();
    });
  }

  module('changes-source-long-polling', {
    async beforeEach() {
      db = this.db;
      this.protect = protect;
      ctx = {
        request: opts => db.get('couch')._request(opts)
      };
      await this.recreate();
    }
  });

  test('listen save and delete', function(assert) {
    let source = new Feed({
      url: `${db.get('url')}/_changes`,
      qs: {
        include_docs: true
      }
    }, ctx);
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

  test('listen protected database', function(assert) {
    let source;
    let events = [];
    return this.protect().then(() => {
      source = new Feed({
        url: `${db.get('url')}/_changes`,
        qs: {
          include_docs: true
        }
      }, ctx);
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

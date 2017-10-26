import Ember from 'ember';
import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';

const {
  A
} = Ember;

configurations(module => {

  let db;

  function protect() {
    return this.admin().then(() => {
      return db.get('security').save({
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

  module('database-changes-forbidden', {
    async beforeEach() {
      db = this.db;
      this.protect = protect;
      await this.recreate();
    }
  });

  test('attempt to listen for changes', function(assert) {
    let data = A();
    return this.protect().then(() => {
      let changes = db.changes({ feed: this.config.feed, reconnect: 100, heartbeat: 10 });
      changes.on('data', doc => {
        data.push(doc);
      });
      changes.on('error', err => {
        data.push(err.toJSON());
      });
      changes.start();
      return wait(null, 1000);
    }).then(() => {
      if(this.config.feed === 'continuous') {
        assert.deepEqual(data[0],
          {
            "error": "unauthorized",
            "reason": "You are not authorized to access this db.",
            "status": 401
          }
        );
      } else if(this.config.feed === 'event-source') {
        assert.deepEqual(data[0],
          {
            "error": "event source",
            "reason": "unknown"
          }
        );
      } else if(this.config.feed === 'long-polling') {
        assert.deepEqual(data[0],
          {
            "error": "unauthorized",
            "reason": "You are not authorized to access this db.",
            "status": 401
          }
        );
      } else {
        assert.ok(false, 'feed');
      }
      return this.admin().then(() => wait(null, 1000));
    }).then(() => {
      data.clear();
      return db.save({ _id: 'foof' }).then(() => wait(null, 1000));
    }).then(() => {
      assert.deepEqual_(data.map(row => row.doc), [
        {
          "_id": "foof",
          "_rev": "ignored"
        }
      ]);
    });
  });

});

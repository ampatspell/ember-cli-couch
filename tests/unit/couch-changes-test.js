import Ember from 'ember';
import { configurations, cleanup, wait } from '../helpers/setup';
import CouchChanges from 'couch/couch/changes';

const {
  A
} = Ember;

configurations(({ module, test, createDatabase, config }) => {

  let db;
  let couch;

  function flush() {
    db = createDatabase();
    couch = db.get('couch');
  }

  module('couch-changes', () => {
    flush();
    return cleanup(db);
  });

  test('create changes', assert => {
    let changes = couch.changes();
    assert.ok(changes);
    assert.ok(CouchChanges.detectInstance(changes));
  });

  test('drop, create database', assert => {
    let changes = couch.changes({ feed: config.feed });
    let log = [];
    changes.on('data', json => {
      log.push(json);
    });
    changes.start();
    return wait(null, 300).then(() => {
      return db.get('database').recreate({ type: 'database' });
    }).then(() => {
      return wait(null, 1000);
    }).then(() => {
      if(config.key === '2.0') {
        log = A(log).filter(row => row.db_name !== '_dbs');
        assert.deepEqual_(log, [
          {
            "db_name": "ember-cli-couch",
            "seq": log[0].seq,
            "type": "deleted"
          },
          {
            "db_name": "ember-cli-couch",
            "seq": log[1].seq,
            "type": "created"
          }
        ]);
      } else {
        assert.deepEqual_(log, [
          {
            "db_name": "ember-cli-couch",
            "type": "deleted"
          },
          {
            "db_name": "ember-cli-couch",
            "type": "created"
          }
        ]);
      }
    })
  });

});

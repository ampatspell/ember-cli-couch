import Ember from 'ember';
import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';
import CouchChanges from 'couch/couch/changes';

const {
  A
} = Ember;

configurations(module => {

  let db;
  let couch;
  let feed;

  module('couch-changes', {
    async beforeEach() {
      couch = this.couch;
      db = this.db;
      feed = this.config.feed;
      await this.recreate();
    }
  });

  test('create changes', function(assert) {
    let changes = couch.changes();
    assert.ok(changes);
    assert.ok(CouchChanges.detectInstance(changes));
  });

  test('drop, create database', function(assert) {
    let changes = couch.changes({ feed });
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
      if(this.config.identifier === 'couchdb-2.1') {
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

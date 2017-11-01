import { A } from '@ember/array';
import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';
import CouchChanges from 'couch/couch/changes';

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
    let changes = couch.changes({ feed });
    assert.ok(changes);
    assert.ok(CouchChanges.detectInstance(changes));
  });

  test('drop, create database', function(assert) {
    let changes = couch.changes({ feed, timeout: 2000 });
    let log = [];
    changes.on('data', json => {
      log.push(json);
    });
    changes.start();
    return wait(null, 500).then(() => {
      return db.get('database').delete();
    }).then(() => {
      return wait(null, 500);
    }).then(() => {
      return db.get('database').create();
    }).then(() => {
      return wait(null, 500);
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
      } else if(this.config.identifier === 'couchdb-1.6') {
        if(this.config.feed === 'long-polling') {
          log.forEach(entry => delete entry.ok);
        }
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
    });
  });

});

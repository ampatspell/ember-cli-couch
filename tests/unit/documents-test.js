/* global emit */
import Ember from 'ember';
import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';

const {
  RSVP: { all }
} = Ember;

configurations(module => {

  let db;
  let admin;

  module('documents', {
    async beforeEach() {
      db = this.db;
      admin = this.config.admin;
      await this.recreate();
    }
  });

  test('save doc without id', function(assert) {
    return db.save({ name: 'first' }).then(data => {
      assert.equal(data.id.length, 32);
      assert.deepEqual_({
        "id": data.id,
        "ok": true,
        "rev": "ignored"
      }, data);
      return db.load(data.id);
    }).then(doc => {
      assert.ok(doc._id);
      assert.deepEqual_({
        _id: doc._id,
        _rev: "ignored",
        name: "first"
      }, doc);
    });
  });

  test('save and update document', function(assert) {
    let doc = { _id: 'hello', name: 'first' };
    return db.save(doc).then(data => {
      doc._rev = data.rev;
      doc.location = 'pond';
      return db.save(doc);
    }).then(() => {
      return db.load('hello');
    }).then(doc => {
      assert.deepEqual_({
        "_id": "hello",
        "_rev": "ignored",
        "location": "pond",
        "name": "first"
      }, doc);
    });
  });

  test('load document with missing rev', function(assert) {
    return db.load('hello', { rev: '2-foobar' }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual({
        "error": "not_found",
        "reason": "missing",
        "status": 404
      }, err.toJSON());
    });
  });

  test('delete document succeeds', function(assert) {
    return db.save({ _id: 'hello' }).then(data => {
      return db.delete('hello', data.rev);
    }).then(data => {
      assert.deepEqual_({
        id: "hello",
        ok: true,
        rev: "ignored"
      }, data);
    });
  });

  test('all', function(assert) {
    return db.save({_id: 'hello'}).then(() => {
      return db.all({ include_docs: true });
    }).then(data => {
      assert.deepEqual_({
        "offset": 0,
        "total_rows": 1,
        "rows": [
          {
            "doc": {
              "_id": "hello",
              "_rev": "ignored"
            },
            "id": "hello",
            "key": "hello",
            "value": {
              "rev": "ignored"
            }
          }
        ]
      }, data);
    });
  });

  let ddoc = {
    _id: '_design/main',
    views: {
      all: {
        map: function(doc) {
          emit(doc._id, null);
        }.toString()
      }
    }
  };

  test('view with key', function(assert) {
    return db.get('couch.session').save(admin.name, admin.password).then(() => {
      return all([
        db.save(ddoc),
        db.save({ _id: 'hello' })
      ]);
    }).then(() => {
      return db.view('main', 'all', { key: 'hello', keys: undefined });
    }).then(data => {
      assert.deepEqual_({
        "offset": 0,
        "total_rows": 1,
        "rows": [
          {
            "id": "hello",
            "key": "hello",
            "value": null
          }
        ],
      }, data);
    });
  });

  test('url', function(assert) {
    assert.equal(db.get('url'), `${this.config.couch.url}/${this.config.name}`);
  });

});

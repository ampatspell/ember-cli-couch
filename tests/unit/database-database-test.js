import Ember from 'ember';
import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { later } from 'couch/util/run';

const {
  RSVP: { resolve }
} = Ember;

configurations({ defaults: true }, module => {

  let db;

  module('database-database', {
    async beforeEach() {
      db = this.db;
      await this.recreate();
    }
  });

  test('exists', function(assert) {
    assert.ok(db);
  });

  test('get database info', function(assert) {
    return db.info().then(resp => {
      assert.ok(resp);
      assert.equal(resp.db_name, this.config.name);
    });
  });

  test('delete and create database', function(assert) {
    return this.admin().then(() => {
      return db.get('database').create({ optional: true });
    }).then(data => {
      assert.deepEqual({
        existed: true,
        ok: true
      }, data);
      return db.get('database').delete();
    }).then(data => {
      assert.deepEqual({ ok: true }, data);
      return later(300).then(() => db.get('database').create());
    }).then(data => {
      assert.deepEqual({ ok: true }, data);
      return db.info();
    }).then(data => {
      assert.equal(data.db_name, this.config.name);
    });
  });

  test('create non-optional database', function(assert) {
    return this.logout().then(() => {
      return db.get('database').create();
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual_({
        "error": "unauthorized",
        "reason": "You are not a server admin.",
        "status": 401
      }, err.toJSON());
    });
  });

  test('delete non-optional database', function(assert) {
    return this.logout().then(() => {
      return db.get('database').delete();
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual_({
        "error": "unauthorized",
        "reason": "You are not a server admin.",
        "status": 401
      }, err.toJSON());
    });
  });

  test('delete optional database', function(assert) {
    return db.get('database').delete({ optional: true }).then(data => {
      assert.deepEqual({ ok: true }, data);
      return db.get('database').delete({ optional: true });
    }).then(data => {
      assert.deepEqual({ ok: true, existed: false }, data);
    });
  });

  test('recreate database type:documents', function(assert) {
    return db.save({_id: 'hello'}).then(() => {
      return db.get('database').recreate({ type: 'documents' });
    }).then(data => {
      assert.deepEqual_({ ok: true }, data);
      return db.all();
    }).then(data => {
      assert.deepEqual_({
        "offset": 0,
        "total_rows": 0,
        "rows": []
      }, data);
    });
  });

  test('recreate database type:database', function(assert) {
    return db.save({_id: 'hello'}).then(() => {
      return db.get('database').recreate({ type: 'database' });
    }).then(data => {
      assert.deepEqual_({ ok: true }, data);
      return db.all();
    }).then(data => {
      assert.deepEqual_({
        "offset": 0,
        "total_rows": 0,
        "rows": []
      }, data);
    });
  });

  test('recreate with invalid type', function(assert) {
    return resolve().then(() => {
      return db.get('database').recreate({ type: 'bogus '});
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.equal(err.message, 'Assertion Failed: opts.type must be either documents or database');
    });
  });

});

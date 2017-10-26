import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';

configurations({ defaults: true }, module => {

  let security;
  let db;

  module('security', {
    async beforeEach() {
      db = this.db;
      security = db.get('security');
      await this.recreate();
    }
  });

  const blank = {
    admins: {
      names: [],
      roles: []
    },
    members: {
      names: [],
      roles: []
    }
  };

  test('exists', function(assert) {
    assert.ok(security);
  });

  test('load succeeds', function(assert) {
    return security.save(blank).then(() => {
      return security.load();
    }).then(data => {
      assert.deepEqual_(blank, data);
    });
  });

  test('save fails', function(assert) {
    return this.logout().then(() => {
      return security.save({});
    }).then(() => {
      assert.ok(false, 'should reject');
    }, (err) => {
      if(err.reason === 'no_majority') {
        // 2.0 bug
        assert.deepEqual(err.toJSON(), {
          "error": "error",
          "reason": "no_majority",
          "status": 500
        });
      } else {
        assert.deepEqual({
          "error": "unauthorized",
          "reason": "You are not a db or server admin.",
          "status": 401
        }, err.toJSON());
      }
    });
  });

  test('save succeeds', function(assert) {
    return this.admin().then(() => {
      return security.save({
        admins: {
          names: [ 'larry' ]
        }
      });
    }).then(data => {
      assert.deepEqual({
        "ok": true
      }, data);
      return security.load();
    }).then(data => {
      assert.deepEqual({
        "admins": {
          "names": [ "larry" ]
        }
      }, data);
      return security.save({});
    });
  });

  test('save with undefined', function(assert) {
    return this.admin().then(() => {
      return security.save();
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      if(err.reason === 'invalid UTF-8 JSON') {
        // 2.0
        assert.deepEqual(err.toJSON(), {
          "error": "bad_request",
          "reason": "invalid UTF-8 JSON",
          "status": 400
        });
      } else {
        assert.deepEqual({
          "error": "bad_request",
          "reason": "invalid_json",
          "status": 400
        }, err.toJSON());
      }
    });
  });

});

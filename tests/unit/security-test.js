import { configurations, cleanup, logout, login } from '../helpers/setup';

configurations(({ module, test, createDatabase }) => {

  let security;
  let db;

  module('security', () => {
    db = createDatabase();
    security = db.get('security');
    return cleanup(db);
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

  test('exists', assert => {
    assert.ok(security);
  });

  test('load succeeds', (assert) => {
    return security.save(blank).then(() => {
      return security.load();
    }).then(data => {
      assert.deepEqual_(blank, data);
    });
  });

  test('save fails', (assert) => {
    return logout(db).then(() => {
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

  test('save succeeds', (assert) => {
    return login(db).then(() => {
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

  test('save with undefined', (assert) => {
    return login(db).then(() => {
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

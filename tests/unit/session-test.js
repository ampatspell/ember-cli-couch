import { configurations, admin, logout } from '../helpers/setup';

configurations(({ module, test, createDatabase, config }) => {

  let session;

  module('session', () => {
    let db = createDatabase();
    session = db.get('couch.session');
    return logout(db);
  });

  test('session exists', assert => {
    assert.ok(session);
  });

  test('load anonymous', function(assert) {
    return session.load().then(data => {
      assert.equal(data.ok, true);
      assert.equal(data.userCtx.name, null);
      assert.deepEqual(data.userCtx.roles, []);
    });
  });

  test('save succeeds', function(assert) {
    return session.save(admin.name, admin.password).then(data => {
      assert.equal(data.ok, true);
      // 1.6 vs 2.0
      if(config.key === '1.6') {
        assert.equal(data.name, null);
      } else if(config.key === '2.0') {
        assert.equal(data.name, admin.name);
      } else {
        assert.ok(false, 'version');
      }
      return session.load();
    }).then(data => {
      assert.equal(data.userCtx.name, admin.name);
    });
  });

  test('save fails', function(assert) {
    return session.save('foof', '123').then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual({
        "status": 401,
        "error": "unauthorized",
        "reason": "Name or password is incorrect."
      }, err.toJSON());
    });
  });

  test('delete succeeds', function(assert) {
    return session.save(admin.name, admin.password).then(() => {
      return session.delete();
    }).then(data => {
      assert.deepEqual({ ok: true }, data);
      return session.load();
    }).then(data => {
      assert.equal(data.ok, true);
      assert.equal(data.userCtx.name, null);
      assert.deepEqual(data.userCtx.roles, []);
    });
  });

  function testTrigger(name, fn) {
    test(name, (assert) => {
      let docs = session;

      let log = [];

      docs.on('login', function() {
        log.push('login');
      });

      docs.on('logout', function() {
        log.push('logout');
      });

      return fn(assert, docs, log);
    });
  }

  testTrigger('login triggers', (assert, docs, log) => {
    return docs.save(admin.name, admin.password).then(() => {
      assert.deepEqual(log, ['login']);
    });
  });

  testTrigger('login fails triggers logout', (assert, docs, log) => {
    return docs.save(admin.name, 'bogus').then(() => {
      assert.ok(false, 'should reject');
    }, () => {
      assert.deepEqual(log, ['logout']);
    });
  });

  testTrigger('logout triggers', (assert, docs, log) => {
    return docs.delete().then(() => {
      assert.deepEqual(log, ['logout']);
    });
  });

});

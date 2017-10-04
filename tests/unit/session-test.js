import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';

configurations(module => {

  let session;

  module('session', {
    async beforeEach() {
      session = this.db.get('couch.session');
      return this.logout();
    }
  });

  test('session exists', function(assert) {
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
    return session.save(this.config.admin.name, this.config.admin.password).then(data => {
      assert.equal(data.ok, true);
      // 1.6 vs 2.0
      if(this.config.identifier === 'couchdb-1.6') {
        assert.equal(data.name, null);
      } else if(this.config.identifier === 'couchdb-2.1') {
        assert.equal(data.name, this.config.admin.name);
      } else {
        assert.ok(false, 'version');
      }
      return session.load();
    }).then(data => {
      assert.equal(data.userCtx.name, this.config.admin.name);
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
    return session.save(this.config.admin.name, this.config.admin.password).then(() => {
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
    test(name, function(assert) {
      let docs = session;

      let log = [];

      docs.on('login', function() {
        log.push('login');
      });

      docs.on('logout', function() {
        log.push('logout');
      });

      return fn.call(this, assert, docs, log);
    });
  }

  testTrigger('login triggers', function(assert, docs, log) {
    return docs.save(this.config.admin.name, this.config.admin.password).then(() => {
      assert.deepEqual(log, ['login']);
    });
  });

  testTrigger('login fails triggers logout', function(assert, docs, log) {
    return docs.save(this.config.admin.name, 'bogus').then(() => {
      assert.ok(false, 'should reject');
    }, () => {
      assert.deepEqual(log, ['logout']);
    });
  });

  testTrigger('logout triggers', function(assert, docs, log) {
    return docs.delete().then(() => {
      assert.deepEqual(log, ['logout']);
    });
  });

});

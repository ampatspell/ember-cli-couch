import Ember from 'ember';
import module from '../helpers/module-for-db';
import { test } from '../helpers/qunit';
import buildDeepEqual from 'couch/util/deep-equal';

const {
  RSVP: { resolve }
} = Ember;

let eq;

module('deep-equal', {
  beforeEach() {
    eq = buildDeepEqual({ allowEmberObjects: false });
  }
});

test('int', function(assert) {
  assert.ok(eq(1, 1));
  assert.ok(!eq(1, 2));
});

test('string', function(assert) {
  assert.ok(eq('a', 'a'));
  assert.ok(!eq('a', 'b'));
});

test('array', function(assert) {
  assert.ok(eq([ 'a', 'b' ], [ 'a', 'b' ]));
  assert.ok(!eq([ 'a', 'b' ], [ 'a' ]));
  assert.ok(!eq([ 'a', 'b' ], [ 'b', 'a' ]));
});

test('object', function(assert) {
  assert.ok(eq({ ok: true, foo: 'bar' }, { foo: 'bar', ok: true }));
  assert.ok(!eq({ ok: true }, { foo: 'bar', ok: true }));
  assert.ok(!eq({ ok: true, foo: 1 }, { foo: 'bar', ok: true }));
});

test('ember object', function(assert) {
  let object = Ember.Object.create();
  return resolve().then(() => {
    eq(object, object);
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "deep-equal",
      "reason": "ember object instances are not allowed"
    });
  });
});

test('ember object with allowEmberObjects:true', function(assert) {
  eq = buildDeepEqual({ allowEmberObjects: true });
  let object = Ember.Object.create();
  assert.ok(eq(object, object));
  assert.ok(!eq(Ember.Object.create(), Ember.Object.create()));
});

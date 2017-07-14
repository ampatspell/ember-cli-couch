import Ember from 'ember';
import { configurations } from '../helpers/setup';
import buildDeepEqual from 'couch/util/deep-equal';

const {
  RSVP: { resolve }
} = Ember;

configurations({ only: '1.6' }, ({ module, test }) => {

  let eq;

  module('deep-equal', () => {
    eq = buildDeepEqual({ allowEmberObjects: false });
  });

  test('int', assert => {
    assert.ok(eq(1, 1));
    assert.ok(!eq(1, 2));
  });

  test('string', assert => {
    assert.ok(eq('a', 'a'));
    assert.ok(!eq('a', 'b'));
  });

  test('array', assert => {
    assert.ok(eq([ 'a', 'b' ], [ 'a', 'b' ]));
    assert.ok(!eq([ 'a', 'b' ], [ 'a' ]));
    assert.ok(!eq([ 'a', 'b' ], [ 'b', 'a' ]));
  });

  test('object', assert => {
    assert.ok(eq({ ok: true, foo: 'bar' }, { foo: 'bar', ok: true }));
    assert.ok(!eq({ ok: true }, { foo: 'bar', ok: true }));
    assert.ok(!eq({ ok: true, foo: 1 }, { foo: 'bar', ok: true }));
  });

  test('ember object', assert => {
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

  test('ember object with allowEmberObjects:true', assert => {
    eq = buildDeepEqual({ allowEmberObjects: true });
    let object = Ember.Object.create();
    assert.ok(eq(object, object));
    assert.ok(!eq(Ember.Object.create(), Ember.Object.create()));
  });

});
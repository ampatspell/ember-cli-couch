import { configurations, cleanup, next } from '../helpers/setup';
import SourceEventSource from 'couch/couch/changes/source/event-source';

configurations({ only: '1.6' }, ({ module, test, createDatabase }) => {

  let db;
  let changes;

  function flush() {
    db = createDatabase();
    changes = db.get('changes');
  }

  module('database-changes', () => {
    flush();
    return cleanup(db);
  });

  test('database has changes prop', assert => {
    assert.ok(db.get('changes'));
  });

  test('database changes is by default disabled, type is event source', assert => {
    assert.ok(!db.get('changes.enabled'));
    assert.ok(db.get('changes.type') === 'event-source');
  });

  test('lookup source class', assert => {
    let Class = db.get('changes')._lookupSourceClass('event-source');
    assert.ok(Class);
    assert.ok(Class === SourceEventSource);
  });

  test('on changes enabled, source is set and unset on disabled', assert => {
    changes.set('enabled', true);
    return next().then(() => {
      assert.ok(changes.get('source'));
      changes.set('enabled', false);
      return next();
    }).then(() => {
      assert.ok(!changes.get('source'));
      changes.set('enabled', true);
      return next();
    }).then(() => {
      assert.ok(changes.get('source'));
    });
  });

});

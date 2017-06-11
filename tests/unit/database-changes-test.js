import { configurations, cleanup, next } from '../helpers/setup';
import EventSourceFeed from 'couch/couch/database/changes-feed/event-source';

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

  test('database changes is by default disabled, feed is event source', assert => {
    assert.ok(!db.get('changes.enabled'));
    assert.ok(db.get('changes.feed') === 'event-source');
  });

  test('lookup feed class', assert => {
    let Class = db.get('changes')._lookupFeedClass('event-source');
    assert.ok(Class);
    assert.ok(Class === EventSourceFeed);
  });

  test('on changes enabled, feed is set and unset on disabled', assert => {
    changes.set('enabled', true);
    return next().then(() => {
      assert.ok(changes.get('_feed'));
      changes.set('enabled', false);
      return next();
    }).then(() => {
      assert.ok(!changes.get('_feed'));
      changes.set('enabled', true);
      return next();
    }).then(() => {
      assert.ok(changes.get('_feed'));
    });
  });

});

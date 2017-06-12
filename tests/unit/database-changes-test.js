import { configurations, cleanup } from '../helpers/setup';
import EventSourceFeed from 'couch/couch/database/changes-feed/event-source';

configurations(({ module, test, createDatabase, config }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('database-changes', () => {
    flush();
    return cleanup(db);
  });

  test('database changes is by default disabled, feed is event source', assert => {
    let changes = db.changes();
    assert.ok(changes.get('opts.feed') === 'event-source');
    assert.ok(!changes.get('isStarted'));
  });

  test('lookup feed class', assert => {
    let changes = db.changes();
    let Class = changes._lookupFeedClass('event-source');
    assert.ok(Class);
    assert.ok(Class === EventSourceFeed);
  });

  test('on changes enabled, feed is set and unset on disabled', assert => {
    let changes = db.changes();
    changes.start();
    assert.ok(changes.get('_feed'));
  });

  test('changes feed options', assert => {
    let changes = db.changes();
    assert.deepEqual(changes._feedOptions(), {
      url: `${config.url}/${config.name}/_changes`,
      qs: {
        "attachments": undefined,
        "conflicts": undefined,
        "descending": undefined,
        "doc_ids": undefined,
        "filter": undefined,
        "heartbeat": undefined,
        "include_docs": true,
        "style": undefined,
        "timeout": undefined,
        "view": undefined
      }
    });
  });

});

import { configurations, cleanup } from '../helpers/setup';
import EventSourceFeed from 'couch/couch/changes/feed/unified/event-source';

configurations(({ module, test, createDatabase, config }) => {

  let db;

  function flush() {
    db = createDatabase();
  }

  module('database-changes', () => {
    flush();
    return cleanup(db);
  });

  test('database changes is by default disabled, feeds are event source and long polling', assert => {
    let changes = db.changes();
    assert.deepEqual(changes.get('opts.feed'), [ 'event-source', 'long-polling' ]);
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
      since: undefined,
      delay: undefined,
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

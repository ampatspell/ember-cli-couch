import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import EventSourceFeed from 'couch/couch/changes/feed/unified/event-source';

configurations(module => {

  let db;

  module('database-changes', {
    async beforeEach() {
      db = this.db;
      await this.recreate();
    }
  });

  test('database changes is by default disabled, feeds are event source and long polling', function(assert) {
    let changes = db.changes();
    assert.deepEqual(changes.get('opts.feed'), [ 'event-source', 'long-polling' ]);
    assert.ok(!changes.get('isStarted'));
  });

  test('lookup feed class', function(assert) {
    let changes = db.changes();
    let Class = changes._lookupFeedClass('event-source');
    assert.ok(Class);
    assert.ok(Class === EventSourceFeed);
  });

  test('on changes enabled, feed is set and unset on disabled', function(assert) {
    let changes = db.changes();
    changes.start();
    assert.ok(changes.get('_feed'));
  });

  test('changes feed options', function(assert) {
    let changes = db.changes();
    assert.deepEqual(changes._feedOptions(), {
      since: undefined,
      reconnect: undefined,
      url: `${this.config.couch.url}/${this.config.name}/_changes`,
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

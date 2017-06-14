import { configurations, cleanup, wait } from '../helpers/setup';
import CouchChanges from 'couch/couch/changes';

configurations(({ module, test, createDatabase }) => {

  let db;
  let couch;

  function flush() {
    db = createDatabase();
    couch = db.get('couch');
  }

  module('couch-changes', () => {
    flush();
    return cleanup(db);
  });

  test.only('create changes', assert => {
    let changes = couch.changes();
    assert.ok(changes);
    assert.ok(CouchChanges.detectInstance(changes));
  });

});

import { configurations, cleanup, wait } from '../helpers/setup';

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

  test.skip('create changes', assert => {
    let changes = couch.changes();
    assert.ok(changes);
  });

});

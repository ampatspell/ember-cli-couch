import { configurations } from '../helpers/setup';

configurations(({ module, test, createDatabase, config }) => {

  let db;

  module('configuration', () => {
    db = createDatabase();
  });

  test('info', assert => {
    return db.get('couch').info().then(json => {
      assert.equal('Welcome', json.couchdb);
      assert.ok(json.version.indexOf(config.key) === 0);
    });
  });

});

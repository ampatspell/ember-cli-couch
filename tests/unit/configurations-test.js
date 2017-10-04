import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';

configurations(module => {

  module('configuration', {
    async beforeEach() {
      await this.recreate();
    }
  });

  test('info', async function(assert) {
    let json = await this.db.get('couch').info();
    assert.equal(json.couchdb, 'Welcome');
    assert.equal(json.version, this.config.version);
  });

});

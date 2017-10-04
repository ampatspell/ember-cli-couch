/* global emit */
import Ember from 'ember';
import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';

const {
  copy
} = Ember;

configurations(module => {

  let db;
  let design;

  const foof = {
    config: {
      version: '1.0.0',
      roles: ['a', 'b']
    },
    views: {
      all: {
        map: function(doc) { emit(doc._id, null); }
      }
    }
  };

  module('design', {
    async beforeEach() {
      db = this.db;
      design = db.get('design');
      await this.recreate();
    }
  });

  test('exists', assert => {
    assert.ok(design);
  });

  test('design is inserted', assert => {
    return design.save('foof', foof).then(resp => {
      assert.deepEqual_(resp, {
        "id": "_design/foof",
        "ok": true,
        "rev": "ignored",
        "saved": true
      });
      return design.load('foof');
    }).then(doc => {
      assert.deepEqual_(doc, {
        "_id": "_design/foof",
        "_rev": "ignored",
        "language": "javascript",
        "config": {
          "version": "1.0.0",
          "roles": ["a", "b"]
        },
        "views": {
          "all": {
            "map": "function(doc) {\n            emit(doc._id, null);\n          }"
          }
        }
      });
    });
  });

  test('identical design document is not saved over', (assert) => {
    let rev;
    return design.save('foof', foof).then(resp => {
      assert.ok(resp.saved);
      rev = resp.rev;
      return design.save('foof', foof);
    }).then(resp => {
      assert.equal(rev, resp.rev);
      assert.deepEqual_(resp, {
        "id": "_design/foof",
        "ok": true,
        "rev": "ignored",
        "saved": false
      });
    });
  });

  test('changed ddoc is saved over', assert => {
    return design.save('foof', foof).then(resp => {
      assert.ok(resp.saved);
      let foof_ = copy(foof);
      foof_.config.roles = copy(foof_.config.roles);
      foof_.config.roles.push('c');
      return design.save('foof', foof_);
    }).then(resp => {
      assert.deepEqual_(resp, {
        "id": "_design/foof",
        "ok": true,
        "rev": "ignored",
        "saved": true
      });
    });
  });

  test('delete missing', assert => {
    return design.delete('foof', { optional: true }).then(resp => {
      assert.deepEqual(resp, {
        "ok": true,
        "deleted": false,
        "id": "_design/foof"
      });
    });
  });

  test('delete existing', assert => {
    return design.save('foof', foof).then(() => {
      return design.delete('foof');
    }).then(resp => {
      assert.deepEqual_(resp, {
        "ok": true,
        "rev": "ignored",
        "deleted": true,
        "id": "_design/foof"
      });
    });
  });

});

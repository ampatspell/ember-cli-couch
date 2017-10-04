import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';

configurations({ identifiers: [ 'couchdb-2.1' ] }, module => {

  let db;
  let mango;

  module('mango', {
    async beforeEach() {
      db = this.db;
      mango = db.get('mango');
      await this.recreate();
    }
  });

  test('create index', function(assert) {
    return mango.save('foof', 'one', { fields: [ 'a', 'b' ] }).then(res => {
      assert.deepEqual(res, {
        "id": "_design/foof",
        "name": "one",
        "result": "created"
      });
      return db.get('design').load('foof');
    }).then(doc => {
      assert.deepEqual_(doc, {
        "_id": "_design/foof",
        "_rev": "ignored",
        "language": "query",
        "views": {
          "one": {
            "map": {
              "fields": {
                "a": "asc",
                "b": "asc"
              }
            },
            "options": {
              "def": {
                "fields": [ 'a', 'b' ]
              }
            },
            "reduce": "_count"
          }
        }
      });
    });
  });

  test('load indexes', function(assert) {
    return mango.save('foof', 'type', { fields: [ 'type' ] }).then(() => {
      return mango.all();
    }).then(doc => {
      assert.deepEqual(doc, {
        "total_rows": 2,
        "indexes": [
          {
            "ddoc": null,
            "name": "_all_docs",
            "type": "special",
            "def": {
              "fields": [
                {
                  "_id": "asc"
                }
              ]
            }
          },
          {
            "ddoc": "_design/foof",
            "name": "type",
            "type": "json",
            "def": {
              "fields": [
                {
                  "type": "asc"
                }
              ]
            }
          }
        ]
      });
    });
  });

  test('delete index', function(assert) {
    return mango.save('foof', 'type', { fields: [ 'type' ] }).then(() => {
      return mango.save('foof', 'name', { fields: [ 'name' ] });
    }).then(() => {
      return mango.delete('foof', 'type');
    }).then(json => {
      assert.deepEqual(json, {
        ok: true
      });
      return db.get('design').load('foof');
    }).then(json => {
      assert.deepEqual_(json, {
        "_id": "_design/foof",
        "_rev": "ignored",
        "language": "query",
        "views": {
          "name": {
            "map": {
              "fields": {
                "name": "asc"
              }
            },
            "reduce": "_count",
            "options": {
              "def": {
                "fields": [
                  "name"
                ]
              }
            }
          }
        }
      });
    });
  });

});

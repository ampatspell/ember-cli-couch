import { configurations, cleanup } from '../helpers/setup';

configurations({ only: '2.0' }, ({ module, test, createDatabase }) => {

  let db;
  let mango;

  module('mango', () => {
    db = createDatabase();
    mango = db.get('mango');
    return cleanup(db);
  });

  test('create index', assert => {
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

  test('load indexes', assert => {
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

  test('delete index', assert => {
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

import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import createBlob from 'couch/util/create-blob';

configurations(module => {

  let db;

  module('documents-attachments', {
    async beforeEach() {
      db = this.db;
      return this.recreate();
    }
  });

  test('save doc with attachment', function(assert) {
    return db.save({
      _id: 'thing',
      _attachments: {
        original: {
          content_type: 'text/plain',
          data: 'hey there'
        }
      }
    }).then(resp => {
      assert.deepEqual_({
        "ok": true,
        "id": "thing",
        "rev": "ignored",
        "reload": true,
      }, resp);

      return db.load('thing');
    }).then(doc => {
      assert.deepEqual_({
        "_attachments": {
          "original": {
            "content_type": "text/plain",
            "digest": "md5-NGYAayuBwPH5Ikr7+6OUFA==",
            "length": 9,
            "revpos": 1,
            "stub": true
          }
        },
        "_id": "thing",
        "_rev": "ignored"
      }, doc);
    });
  });

  test('save doc with stubs', function(assert) {
    return db.save({
      _id: 'thing',
      _attachments: {
        original: {
          content_type: 'text/plain',
          data: 'hey there'
        }
      }
    }).then(() => {
      return db.load('thing');
    }).then(doc => {
      return db.save(doc);
    }).then(data => {
      assert.deepEqual_({
        "id": "thing",
        "ok": true,
        "rev": "ignored"
      }, data);
    });
  });

  test('save doc without id', function(assert) {
    return db.save({
      _attachments: {
        original: {
          content_type: 'text/plain',
          data: 'hey there'
        }
      }
    }).then(data => {
      assert.ok(data.id.length === 32);
    });
  });

  test('save doc with file attachment', function(assert) {
    let blob = createBlob('<h1>hey</h1>', 'text/html');
    return db.save({
      _id: 'hello',
      _attachments: {
        original: {
          data: blob
        }
      }
    }).then(() => {
      return db.load('hello');
    }).then(doc => {
      assert.deepEqual_({
        "_attachments": {
          "original": {
            "content_type": "text/html",
            "digest": "ignored",
            "length": 12,
            "revpos": "ignored",
            "stub": true
          }
        },
        "_id": "hello",
        "_rev": "ignored"
      }, doc);
    });
  });

  test('save text with special chars', function(assert) {
    return db.save({
      _id: 'hello',
      _attachments: {
        text: {
          content_type: 'text/plain',
          data: 'āšūč or something'
        }
      }
    }).then(() => {
      return db.load('hello').then(doc => {
        assert.deepEqual_({
          "_attachments": {
            "text": {
              "content_type": "text/plain",
              "digest": "ignored",
              "length": 21,
              "revpos": "ignored",
              "stub": true
            }
          },
          "_id": "hello",
          "_rev": "ignored"
        }, doc);
      });
    });
  });

});

import configurations from '../helpers/configurations';
import { test } from '../helpers/qunit';
import { wait } from '../helpers/run';

configurations(module => {

  let db;
  let feed;

  module('database-changes-data', {
    async beforeEach() {
      db = this.db;
      feed = this.config.feed;
      await this.recreate();
    }
  });

  test(`event source and longpoll has the same data (${feed})`, function(assert) {
    let data = [];
    let changes = db.changes({ feed });
    changes.on('data', doc => {
      data.push(doc);
    });
    changes.start();
    return wait(null, 1000).then(() => {
      return db.save({ _id: 'one' });
    }).then(() => {
      return db.save({ _id: 'two' });
    }).then(() => {
      return wait(null, 500);
    }).then(() => {
      return db.save({ _id: 'three' }).then(() => wait(null, 500));
    }).then(() => {
      assert.deepEqual_(data, [
        {
         "changes": [
           {
             "rev": "ignored"
           }
         ],
         "doc": {
           "_id": "one",
           "_rev": "ignored"
         },
         "id": "one",
         "seq": data[0].seq
       },
       {
         "changes": [
           {
             "rev": "ignored"
           }
         ],
         "doc": {
           "_id": "two",
           "_rev": "ignored"
         },
         "id": "two",
         "seq": data[1].seq
       },
       {
         "changes": [
           {
             "rev": "ignored"
           }
         ],
         "doc": {
           "_id": "three",
           "_rev": "ignored"
         },
         "id": "three",
         "seq": data[2].seq
       }
      ]);
    });
  });

});

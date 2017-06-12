# TODO

* abstract Couch, have also PouchDB
* changes listener should be recreated on login/logout
* changes listener for `_db_changes`

## Changes

``` javascript
let changes = db.changes({
  type: 'long-polling',
  ddoc: 'changes',
  view: 'important',
  include_docs: true,
  keepalive: true // todo
});

changes.on('data', doc => {
  console.log(doc);
});

changes.start();
changes.stop();

changes.destroy();

// ember-cli-sofa

let changes = store.get('db.main.changes').create({ type: 'long-polling' });
changes.start();

```

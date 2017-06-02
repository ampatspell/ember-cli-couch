# ember-cli-couch

Addon for CouchDB document API.

```
$ ember install ember-cli-couch
```

## Setup

``` javascript
// instance-initializers/databases.js
import { registerDatabaseServices } from 'couch';

export default {
  name: 'thing:databases',
  initialize(app) {

    registerDatabaseServices(app, {
      db: {
        url: 'http://127.0.0.1:5984',
        name: 'thing'
      }
    });

    app.lookup('service:db'); // => <thing@couch:database::ember362>
  }
};

```

## Usage

``` javascript
// routes/index.js
import Ember from 'ember';

const {
  RSVP: { hash }
} = Ember;

export default Ember.Route.extend({
  model() {
    return hash({
      database: this.get('db').info(),
      couch:    this.get('db.couch').info(),
      session:  this.get('db.couch.session').load(),
      url:      this.get('db.url')
    });
  }
});
```

## API

> Full documentation coming soon.

```
couches
  couch
    couches
    url
    normalizedUrl
    session
      load()
      save(name, password)
      delete()
    request(opts)
    info()
    uuids(count)
    database(name)
      couch
      name
      url
      security
        load()
        save(body)
      design
        id(name)
        load(name, opts)
        save(name, json)
        delete(name, opts)
      database
        info()
        create(opts)
        delete(opts)
        recreate(opts)
      mango
        find(opts)
        explain(opts)
        save(ddoc, name, index)
        all()
        delete()
      info()
      load(id, opts)
      save(doc, opts)
      delete(id, rev, opts)
      view(ddoc, name, opts)
      all(opts)
```

## Dummy

See dummy for usage examples and play with `window.db`:

``` javascript
> db.load('first').then(log)
```

export function registerDatabaseService(app, couches, serviceName, { url, name }) {
  let couch = couches.couch({ url });
  let db = couch.database(name);

  let fullServiceName = `service:${serviceName}`;

  app.register(fullServiceName, db, { instantiate: false });

  [ 'controller', 'component', 'route' ].forEach(key => {
    app.inject(key, serviceName, fullServiceName);
  });
}

/*
registerDatabaseServices(app, {
  db: {
    url: 'http://127.0.0.1:5984',
    name: 'thing'
  },
  ...
});
*/
export function registerDatabaseServices(app, hash) {
  let couches = app.lookup('couch:couches');
  for(let key in hash) {
    registerDatabaseService(app, couches, key, hash[key]);
  }
}

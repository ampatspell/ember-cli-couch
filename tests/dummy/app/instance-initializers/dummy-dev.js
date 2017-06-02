import Ember from 'ember';

const {
  Logger: { info }
} = Ember;

export default {
  name: 'dummy:dev',
  initialize(app) {
    app.inject('controller', 'couches', 'service:couches');
    app.inject('component', 'couches', 'service:couches');
    app.inject('route', 'couches', 'service:couches');

    let couches = app.lookup('service:couches');
    let couch = couches.couch({ url: 'http://127.0.0.1:3984' });

    window.couches = couches;
    window.couch = couch;
    window.db = couch.get('db.thing');

    window.log = info;
  }
};

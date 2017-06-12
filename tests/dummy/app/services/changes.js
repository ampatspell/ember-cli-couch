import Ember from 'ember';
import { array } from 'couch/util/computed';

const {
  inject: { service },
  computed: { bool }
} = Ember;

export default Ember.Service.extend({

  db: service(),
  changes: null,

  isStarted: bool('changes').readOnly(),
  log: array(),

  start() {
    let changes = this.get('db').changes({ feed: 'long-polling', include_docs: true });
    changes.on('data', data => this.get('log').pushObject(data));
    changes.start();
    this.setProperties({ changes });
  }

});

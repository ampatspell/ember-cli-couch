import Service, { inject as service } from '@ember/service';
import { reads, bool } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { array } from 'couch/util/computed';

export default Service.extend({

  db: service(),
  session: reads('db.couch.session'),

  changes: null,

  isStarted: bool('changes').readOnly(),
  log: array(),

  listenForSession: on('init', function() {
    let session = this.get('session');
    let restart = () => this.restart();
    session.on('login', restart);
    session.on('logout', restart);
  }),

  start() {
    let changes = this.get('db').changes({ feed: 'long-polling', include_docs: true });
    changes.on('data', data => this.get('log').pushObject(data));
    changes.start();
    this.setProperties({ changes });
  },

  restart() {
    let changes = this.get('changes');
    if(!changes) {
      return;
    }
    changes.restart();
  }

});

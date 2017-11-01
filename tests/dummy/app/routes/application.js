import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { error } from 'couch/util/logger';

export default Route.extend({

  changes: service(),

  model() {
    return this.get('db.database').create({ optional: true }).catch(err => {
      error('routes/application.js', err.toJSON ? err.toJSON() : err);
    }).finally(() => {
      this.get('changes').start();
    })
  }
});

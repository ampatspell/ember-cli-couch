import Ember from 'ember';

const {
  Logger: { error },
  inject: { service }
} = Ember;

export default Ember.Route.extend({

  changes: service(),

  model() {
    return this.get('db.database').create({ optional: true }).catch(err => {
      error('routes/application.js', err.toJSON ? err.toJSON() : err);
    }).finally(() => {
      this.get('changes').start();
    })
  }
});

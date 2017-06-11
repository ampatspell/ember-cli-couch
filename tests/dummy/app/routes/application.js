import Ember from 'ember';

const {
  Logger: { error }
} = Ember;

export default Ember.Route.extend({
  model() {
    return this.get('db.database').create({ optional: true }).catch(err => {
      error('routes/application.js', err.toJSON ? err.toJSON() : err);
    });
  }
});

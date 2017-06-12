import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [ ':ui-json' ],

  data: null,

  string: computed('data', function() {
    return JSON.stringify(this.get('data'), null, 2);
  }).readOnly()

});

import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNameBindings: [ ':ui-json' ],

  data: null,

  string: computed('data', function() {
    return JSON.stringify(this.get('data'), null, 2);
  }).readOnly()

});

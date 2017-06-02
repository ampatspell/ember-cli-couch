import Ember from 'ember';

export default Ember.Object.extend({

  couch: null,

  unknownProperty(key) {
    return this.get("couch").database(key);
  }

});

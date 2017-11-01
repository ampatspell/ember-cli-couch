import EmberObject from '@ember/object';

export default EmberObject.extend({

  couch: null,

  unknownProperty(key) {
    return this.get("couch").database(key);
  }

});

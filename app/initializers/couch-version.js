import Ember from 'ember';
import environment from '../config/environment';

const {
  name,
  version
} = environment.couch;

let registered = false;

export default {
  name: 'couch:version',
  after: 'couch:internal',
  initialize() {
    if(registered) {
      return;
    }
    Ember.libraries.register(name, version);
    registered = true;
  }
};

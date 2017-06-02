import Ember from 'ember';

const {
  computed
} = Ember;

export default function couch(hash) {
  return computed(function() {
    return this.couch(hash);
  }).readOnly();
}

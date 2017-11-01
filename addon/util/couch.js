import { computed } from '@ember/object';

export default function couch(hash) {
  return computed(function() {
    return this.couch(hash);
  }).readOnly();
}

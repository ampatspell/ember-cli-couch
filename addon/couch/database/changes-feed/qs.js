import Ember from 'ember';

const {
  merge
} = Ember;

export default Superclass => class extends Superclass {

  stop() {
    delete this.since;
    return super.stop();
  }

  get qs() {
    let since = this.since;
    if(typeof since === 'undefined') {
      since = 'now';
    }
    return merge(super.qs, { since });
  }

}

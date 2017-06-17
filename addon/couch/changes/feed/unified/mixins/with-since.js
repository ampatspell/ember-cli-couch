import Ember from 'ember';

const {
  merge
} = Ember;

export default Superclass => class extends Superclass {

  constructor(opts) {
    super(opts);
    this.since = opts.since || undefined;
  }

  get qs() {
    let since = this.since;
    if(typeof since === 'undefined') {
      since = 'now';
    }
    return merge(super.qs, { since });
  }

  stop() {
    super.stop();
    return { since: this.since };
  }

}

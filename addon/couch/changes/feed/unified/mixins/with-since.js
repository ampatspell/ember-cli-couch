import { merge } from '@ember/polyfills';

export default Superclass => class extends Superclass {

  constructor(opts, context) {
    super(opts, context);
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

  onSince(seq) {
    this.since = seq;
  }

}

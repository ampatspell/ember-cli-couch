import SuspendableChanges from './changes/suspendable-changes';

export default SuspendableChanges.extend({

  couch: null,

  _feedOptions() {
    let opts = this.get('opts');

    let {
      since,
      timeout,
      heartbeat,
    } = opts;

    return {
      url: `${this.get('couch.url')}/_db_updates`,
      since,
      qs: {
        timeout,
        heartbeat
      }
    };
  },

  _feedFactoryName(feed) {
    return `couch:couch-changes/feed/${feed}`;
  },

  willDestroy() {
    this.get('couch')._changesWillDestroy(this);
    this._super();
  }

});

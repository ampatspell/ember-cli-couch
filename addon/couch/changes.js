import SuspendableChanges from './changes/suspendable-changes';

export default SuspendableChanges.extend({

  couch: null,

  _feedOptions() {
    let opts = this.get('opts');

    let {
      since,
      timeout,
      heartbeat,
      reconnect
    } = opts;

    let url = this.get('couch.url');

    return {
      url: `${url}/_db_updates`,
      since,
      reconnect,
      qs: {
        timeout,
        heartbeat
      }
    };
  },

  _feedContext() {
    let couch = this.get('couch');
    return {
      request: opts => couch._request(opts)
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

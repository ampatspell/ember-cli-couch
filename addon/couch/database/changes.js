import SuspendableChanges from '../changes/suspendable-changes';
import stringifyUnlessEmpty from '../../util/stringify-unless-empty';

export default SuspendableChanges.extend({

  database: null,

  _feedOptions() {
    let opts = this.get('opts');

    let {
      since,
      view,
      filter,
      include_docs,
      conflicts,
      style,
      timeout,
      attachments,
      heartbeat,
      doc_ids,
      descending,
      reconnect
    } = opts;

    view = view || undefined;

    if(view) {
      filter = '_view';
    }

    if(doc_ids) {
      view = undefined;
      filter = '_doc_ids';
    }

    let url = this.get('database.url');

    return {
      url: `${url}/_changes`,
      since,
      reconnect,
      qs: {
        include_docs,
        conflicts,
        style,
        timeout,
        attachments,
        heartbeat,
        descending,
        doc_ids: stringifyUnlessEmpty(doc_ids),
        view,
        filter
      },
    };
  },

  _feedContext() {
    let couch = this.get('database.couch');
    return {
      request: opts => couch._request(opts)
    };
  },

  _feedFactoryName(feed) {
    return `couch:database-changes/feed/${feed}`;
  },

  willDestroy() {
    this.get('database')._changesWillDestroy(this);
    this._super();
  }

});

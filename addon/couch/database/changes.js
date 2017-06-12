import SuspendableChanges from '../changes/suspendable-changes';
import stringifyUnlessEmpty from '../../util/stringify-unless-empty';

export default SuspendableChanges.extend({

  database: null,

  _feedOptions(start) {
    let opts = this.get('opts');

    let since;
    if(start) {
      since = start.since;
    }

    let {
      view,
      filter,
      include_docs,
      conflicts,
      style,
      timeout,
      attachments,
      heartbeat,
      doc_ids,
      descending
    } = opts;

    view = view || undefined;

    if(view) {
      filter = '_view';
    }

    if(doc_ids) {
      view = undefined;
      filter = '_doc_ids';
    }

    return {
      url: `${this.get('database.url')}/_changes`,
      since,
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

  _feedFactoryName(feed) {
    return `couch:database-changes/feed/${feed}`;
  },

  willDestroy() {
    this.get('database')._changesWillDestroy(this);
    this._super();
  }

});

import SuspendableChanges from './changes/suspendable-changes';

export default SuspendableChanges.extend({

  couch: null,

  _feedFactoryName(feed) {
    return `couch:couch-changes/feed/${feed}`;
  },

  willDestroy() {
    this.get('couch')._changesWillDestroy(this);
    this._super();
  }

});

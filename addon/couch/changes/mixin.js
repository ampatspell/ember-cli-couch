import Mixin from '@ember/object/mixin';
import { merge } from '@ember/polyfills';
import { array } from '../../util/computed';
import { destroyArray } from '../../util/destroy'
import { defaultFeedIdentifiers } from './changes';

export default Mixin.create({

  openChanges: array(),

  changes(opts) {
    opts = merge({ feed: defaultFeedIdentifiers }, opts);
    let changes = this.createChanges(opts);
    this.get('openChanges').pushObject(changes);
    return changes;
  },

  _changesWillDestroy(changes) {
    this.get('openChanges').removeObject(changes);
  },

  willDestroy() {
    destroyArray(this.get('openChanges'));
    this._super();
  }

});

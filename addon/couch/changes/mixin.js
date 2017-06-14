import Ember from 'ember';
import { array } from '../../util/computed';
import { destroyArray } from '../../util/destroy'
import { defaultFeedIdentifier } from './changes';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  openChanges: array(),

  changes(opts) {
    opts = merge({ feed: defaultFeedIdentifier }, opts);
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

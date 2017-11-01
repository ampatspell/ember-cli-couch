import { gt } from '@ember/object/computed';
import { cancel, next } from '@ember/runloop';
import Changes from './changes';
import { array } from '../../util/computed';
import assert from '../../util/assert';

export default Changes.extend({

  _suspended: 0,
  _queue: array(),

  isSuspended: gt('_suspended', 0).readOnly(),

  _trigger(...args) {
    if(this.get('_suspended') === 0 && this.get('_queue.length') === 0) {
      this.trigger(...args);
    } else {
      this.get('_queue').pushObject(args);
      this._enqueueFlush();
    }
  },

  _enqueueFlush() {
    cancel(this.__flush);
    this.__flush = next(this, this._flush);
  },

  _flush() {
    if(this.get('_suspended') > 0) {
      return;
    }
    var queue = this.get('_queue');
    var change = queue.shiftObject();
    if(change) {
      this.trigger(...change);
      this._enqueueFlush();
    }
  },

  _resume() {
    if(this.isDestroying) {
      return;
    }
    this.decrementProperty('_suspended');
    if(this.get('_suspended') === 0) {
      this._enqueueFlush();
    }
  },

  suspend() {
    this.incrementProperty('_suspended');
    let fn = () => {
      assert({ error: 'internal', reason: 'resume already called' }, !fn._called);
      this._resume();
      fn._called = true;
    };
    fn._called = false;
    return fn;
  },

  willDestroy() {
    cancel(this.__flush);
    this._super();
  }

});

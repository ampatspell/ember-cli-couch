import Ember from 'ember';
import assert from '../../util/assert';

const {
  on,
  observer,
  getOwner,
  run: { next, cancel },
  Evented
} = Ember;

export default Ember.Object.extend(Evented, {

  isStarted: false,

  _feedOptions() {
    assert({ error: 'internal', reason: 'override Changes._feedOptions' }, false);
  },

  _feedFactoryName() {
    assert({ error: 'internal', reason: 'override Changes._feedFactoryName' }, false);
  },

  _lookupFeedClass(feed) {
    let name = this._feedFactoryName(feed);
    let factory = getOwner(this).factoryFor(name);
    assert(`changes feed factory named '${name}' is not registered`, !!factory);
    return factory.class;
  },

  _createFeed() {
    let type = this.get('opts.type');
    let Class = this._lookupFeedClass(type);
    let opts = this._feedOptions();
    let instance = new Class(opts);
    return instance;
  },

  start() {
    if(this.get('isStarted')) {
      return;
    }
    let _feed = this._createFeed();
    _feed.delegate = this;
    _feed.start();
    this.setProperties({ _feed, isStarted: true });
  },

  stop() {
    if(!this.get('isStarted')) {
      return;
    }
    let _feed = this.get('_feed');
    _feed.delegate = null;
    _feed.destroy();
    this.setProperties({
      _feed: null,
      isStarted: false
    });
  },

  willDestroy() {
    let _feed = this.get('_feed');
    if(_feed) {
      _feed.destroy();
    }
  },

  _trigger(type, arg) {
    this.trigger(type, arg);
  },

  onData(feed, data) {
    this._trigger('data', data);
  },

  onError(feed, err) {
    this._trigger('error', err);
  },

  onStopped() {
    this._trigger('stopped');
  },

});

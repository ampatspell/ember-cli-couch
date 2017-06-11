import Ember from 'ember';
import assert from '../../util/assert';

const {
  on,
  observer,
  getOwner,
  run: { next, cancel },
  Evented
} = Ember;

export default (...deps) => Ember.Object.extend(Evented, {

  enabled: false,
  feed: 'event-source',

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

  _createFeed(feed) {
    let Class = this._lookupFeedClass(feed);
    let opts = this._feedOptions();
    let instance = new Class(opts);
    return instance;
  },

  _updateFeed() {
    let { feed, enabled, _feed } = this.getProperties('feed', 'enabled', '_feed');
    if(_feed) {
      _feed.destroy();
      _feed = null;
    }
    if(feed && enabled) {
      _feed = this._createFeed(feed);
      _feed.delegate = this;
      _feed.start();
    }
    this.set('_feed', _feed);
  },

  _setSource: on('init', function() {
    this._updateFeed();
  }),

  _sourceDependenciesDidChange: observer('feed', 'enabled', ...deps, function() {
    cancel(this.__updateFeed);
    this.__updateFeed = next(() => this._updateFeed());
  }),

  willDestroy() {
    cancel(this.__updateFeed);
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

});

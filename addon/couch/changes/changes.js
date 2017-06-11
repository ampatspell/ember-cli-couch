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

  enabled: false,
  feed: 'event-source',

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
    let instance = new Class();
    instance._feed = feed;
    return instance;
  },

  _updateFeed() {
    let { feed, enabled, _feed } = this.getProperties('feed', 'enabled', '_feed');
    if(feed && enabled) {
      if(_feed) {
        if(_feed._feed === feed) {
          return;
        }
        _feed.destroy();
      }
      _feed = this._createFeed(feed);
      _feed.delegate = this;
      this.set('_feed', _feed);
      _feed.start();
    } else {
      if(!_feed) {
        return;
      }
      _feed.destroy();
      this.set('_feed', null);
    }
  },

  _setSource: on('init', function() {
    this._updateFeed();
  }),

  _sourceDependenciesDidChange: observer('feed', 'enabled', function() {
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

  //

  onData(feed, json) {
    Ember.Logger.info(json);
  },

  onError(feed, err) {
    Ember.Logger.error(err);
  }

});

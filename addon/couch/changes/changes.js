import Ember from 'ember';
import assert from '../../util/assert';

const {
  getOwner,
  Evented
} = Ember;

export const defaultFeedIdentifier = 'event-source';

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

  _createFeed(input) {
    let { feed } = this.get('opts');
    let Class = this._lookupFeedClass(feed);
    let opts = this._feedOptions(input);
    let instance = new Class(opts);
    return instance;
  },

  start(opts) {
    if(this.get('isStarted')) {
      return;
    }
    let feed = this._createFeed(opts);
    feed.delegate = this;
    feed.start();
    this.setProperties({
      _feed: feed,
      isStarted: true
    });
  },

  stop() {
    if(!this.get('isStarted')) {
      return;
    }
    let feed = this.get('_feed');
    feed.delegate = null;
    let opts = feed.stop();
    this.setProperties({
      _feed: null,
      isStarted: false
    });
    return opts;
  },

  restart() {
    let opts = this.stop();
    this.start(opts);
  },

  willDestroy() {
    this.stop();
    this._super();
  },

  _trigger(type, arg) {
    this.trigger(type, arg);
  },

  onData(feed, data) {
    this._trigger('data', data);
  },

  onError(feed, err) {
    this._trigger('error', err);
  }

});

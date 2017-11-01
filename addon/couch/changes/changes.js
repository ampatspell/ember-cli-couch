import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import Evented from '@ember/object/evented';
import { merge } from '@ember/polyfills';
import { A, isArray } from '@ember/array';
import assert from '../../util/assert';
import { isFastBoot } from '../../util/computed';

export const defaultFeedIdentifiers = [ 'continuous', 'event-source', 'long-polling' ];

const inBrowser = fn => {
  return function(...args) {
    if(this.get('_isFastBoot')) {
      return;
    }
    return fn.call(this, ...args);
  };
}

export default EmberObject.extend(Evented, {

  _isFastBoot: isFastBoot(),

  isStarted: false,

  _feedOptions() {
    assert({ error: 'internal', reason: 'override Changes._feedOptions' }, false);
  },

  _feedFactoryName() {
    assert({ error: 'internal', reason: 'override Changes._feedFactoryName' }, false);
  },

  _feedContext() {
    assert({ error: 'internal', reason: 'override Changes._feedContext' }, false);
  },

  _lookupFeedClass(feed) {
    let name = this._feedFactoryName(feed);
    let factory = getOwner(this).factoryFor(name);
    assert(`changes feed factory named '${name}' is not registered`, !!factory);
    return factory.class;
  },

  _createFeed(Feed) {
    let opts = this._feedOptions();
    let context = this._feedContext();
    let instance = new Feed(opts, context);
    return instance;
  },

  _createSupportedFeed() {
    let { feed } = this.get('opts');
    if(!isArray(feed)) {
      feed = [ feed ];
    }
    let Feed = A(feed).map(name => this._lookupFeedClass(name)).find(feedClass => feedClass.isSupported());
    assert(`no browser supported changes feed type found in listed '${feed.join(', ')}' types`, !!Feed);
    return this._createFeed(Feed);
  },

  start: inBrowser(function() {
    if(this.get('isStarted')) {
      return;
    }
    let feed = this._createSupportedFeed();
    feed.delegate = this;
    feed.start();
    this.setProperties({
      _feed: feed,
      isStarted: true
    });
  }),

  stop: inBrowser(function() {
    if(!this.get('isStarted')) {
      return;
    }
    let feed = this.get('_feed');
    feed.delegate = null;
    let opts = feed.stop();
    this.setProperties({
      _feed: null,
      isStarted: false,
      opts: merge(this.get('opts'), opts)
    });
  }),

  restart: inBrowser(function() {
    this.stop();
    this.start();
  }),

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

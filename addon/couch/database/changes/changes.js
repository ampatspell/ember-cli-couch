import Ember from 'ember';
import assert from '../../../util/assert';

const {
  on,
  observer,
  getOwner,
  run: { next, cancel }
} = Ember;

export default Ember.Object.extend({

  database: null,

  type: 'event-source',
  enabled: false,

  source: null,

  _lookupSourceClass(type) {
    let factory = getOwner(this).factoryFor(`couch:catabase-changes/source/${type}`);
    assert(`changes listener source named '${type}' is not registered`, !!factory);
    return factory.class;
  },

  _createSource(type) {
    let Class = this._lookupSourceClass(type);
    let instance = new Class();
    instance.type = type;
    return instance;
  },

  _updateSource() {
    let { type, enabled } = this.getProperties('type', 'enabled');
    let source = this.get('source');
    if(type && enabled) {
      if(source) {
        if(source.get('type') === type) {
          return;
        }
        source.destroy();
      }
      source = this._createSource(type);
      source.delegate = this;
      this.set('source', source);
      source.start();
    } else {
      if(!source) {
        return;
      }
      source.destroy();
      this.set('source', null);
    }
  },

  _setSource: on('init', function() {
    this._updateSource();
  }),

  _sourceDependenciesDidChange: observer('type', 'enabled', function() {
    cancel(this.__updateSource);
    this.__updateSource = next(() => this._updateSource());
  }),

  willDestroy() {
    cancel(this.__updateSource);
    let source = this.get('source');
    if(source) {
      source.destroy();
    }
  },

  //

  onData(source, json) {
    Ember.Logger.info(json);
  },

  onError(source, err) {
    Ember.Logger.error(err);
  }

});

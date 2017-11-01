import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { object } from './util/computed';
import { destroyObject } from './util/destroy';

export default Service.extend({

  openCouches: object().readOnly(),

  createCouch(url) {
    let couches = this;
    return getOwner(this).factoryFor('couch:couch').create({ couches, url });
  },

  couch({ url }) {
    let open = this.get('openCouches');
    let couch = open[url];
    if(!couch) {
      couch = this.createCouch(url);
      open[url] = couch;
    }
    return couch;
  },

  _destroyOpenCouches() {
    destroyObject(this.get('openCouches'));
  },

  willDestroy() {
    this._destroyOpenCouches();
    this._super();
  }

});

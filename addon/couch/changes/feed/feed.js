import Ember from 'ember';
import { composeURL } from '../../request';

const {
  merge
} = Ember;

/*

  let feed = new Feed(`http://127.0.0.1:5984/thing/_changes?feed=longpoll&include_docs=true&since=now`);

  feed.delegate = {
    onData(f, data) {
      ...
    }
    onError(f, err) {
      ...
    }
  }

  feed.start()

  ...

  feed.stop();

*/
export default class Feed {

  constructor(opts) {
    this.opts = opts;
    this.started = false;
    this.open = false;
    this.delegate = null;
  }

  get url() {
    let { url, qs } = this.opts;
    qs = merge(this.qs || {}, qs);
    return composeURL(url, qs);
  }

  notify(name, ...args) {
    let delegate = this.delegate;
    if(!delegate) {
      return;
    }
    let fn = delegate[name];
    if(!fn) {
      return;
    }
    fn.call(delegate, this, ...args);
  }

  _start() {
  }

  start() {
    if(this.started) {
      return;
    }
    this._start();
    this.started = true;
  }

  _stop() {
  }

  stop() {
    if(!this.started) {
      return;
    }
    this._stop();
    this.started = false;
    this.open = false;
  }

  onOpen() {
    this.open = true;
  }

  onClosed() {
    this.open = false;
  }

  onError(err) {
    this.open = false;
    this.notify('onError', err);
  }

  onData(json) {
    this.notify('onData', json);
  }

  destroy() {
    this.delegate = null;
    this.stop();
  }

}

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
    this.opts = merge({ delay: 3000 }, opts);
    this.delegate = null;
    this.started = false;
  }

  get url() {
    let { url, qs } = this.opts;
    qs = merge(this.qs || {}, qs);
    return composeURL(url, qs);
  }

  notify(name, ...args) {
    if(!this.started) {
      return;
    }
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

  start() {
    this.started = true;
  }

  stop() {
    this.started = false;
  }

  onError(err) {
    this.notify('onError', err);
  }

  onData(json) {
    this.notify('onData', json);
  }

}

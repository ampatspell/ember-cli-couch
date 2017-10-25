import Ember from 'ember';
import Feed from './feed';
import Error from '../../../util/error';

const {
  merge,
  run: { later, cancel }
} = Ember;

export default class ContinuousFeed extends Feed {

  static isSupported() {
    return typeof XMLHttpRequest !== 'undefined';
  }

  constructor(opts, context) {
    super(opts, context);
    this.xhr = null;
    this.len = 0;
    this.bound = {
      onreadystatechange: this.onReadyStateChange.bind(this)
    };
  }

  get qs() {
    return {
      feed: 'continuous'
    };
  }

  start() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', this.url, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');
    for(let key in this.bound) {
      xhr[key] = this.bound[key];
    }
    this.xhr = xhr;
    xhr.send();
    super.start();
  }

  stop() {
    let xhr = this.xhr;
    xhr.abort();
    for(let key in this.bound) {
      xhr[key] = null;
    }
    this.xhr = null;
    this.len = 0;
    cancel(this._start);
    super.stop();
  }

  enqueueRestart() {
    cancel(this._start);
    this._start = later(() => {
      if(!this.started) {
        return;
      }
      this.stop();
      this.start();
    }, this.opts.reconnect);
  }

  onOpened() {
  }

  onHeadersReceived() {
  }

  get json() {
    let text = this.xhr.responseText;
    let value = text.substr(this.len);
    this.len = text.length;
    return JSON.parse(value);
  }

  get jsonError() {
    try {
      let status = this.xhr.status;
      return new Error(merge({ status }, this.json));
    } catch(nested) {
      return new Error({ error: 'continuous', reason: 'unknown', nested });
    }
  }

  onError() {
    let err = this.jsonError;
    super.onError(err);
    this.enqueueRestart();
  }

  onLoading() {
    let status = this.xhr.status;
    if(status === 200) {
      this.onData(this.json);
    } else {
      this.onError();
    }
  }

  onDone() {
    this.enqueueRestart();
  }

  onReadyStateChange() {
    const { OPENED, HEADERS_RECEIVED, LOADING, DONE } = XMLHttpRequest;

    let xhr = this.xhr;
    let readyState = xhr.readyState;

    if(readyState === OPENED) {
      this.onOpened();
    } else if(readyState === HEADERS_RECEIVED) {
      this.onHeadersReceived();
    } else if(readyState === LOADING) {
      this.onLoading();
    } else if(readyState === DONE) {
      this.onDone();
    }
  }

}

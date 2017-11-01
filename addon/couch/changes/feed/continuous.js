import { merge } from '@ember/polyfills';
import { cancel, later } from '@ember/runloop';
import Feed from './feed';
import Error from '../../../util/error';

const safeParse = str => {
  try {
    return JSON.parse(str);
  } catch(err) {
    return;
  }
};

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

  _chunks() {
    let text = this.xhr.responseText;
    let value = text.substr(this.len);
    this.len = text.length;
    return value.split('\n');
  }

  onOpened() {
  }

  onHeadersReceived() {
  }

  onHeartbeat() {
  }

  onMessage(chunk) {
    let json = JSON.parse(chunk);
    this.onData(json);
  }

  _errorFromChunk(chunk) {
    let json = safeParse(chunk);
    if(json) {
      let status = this.xhr.status;
      return new Error(merge({ status }, json));
    }
    return new Error({ error: 'continuous', reason: 'unknown' });
  }

  onError(chunk) {
    let err = this._errorFromChunk(chunk);
    super.onError(err);
    this.enqueueRestart();
  }

  onLoading() {
    let status = this.xhr.status;
    let chunks = this._chunks();
    chunks.forEach(chunk => {
      if(chunk === '') {
        this.onHeartbeat();
      } else if(status === 200) {
        this.onMessage(chunk);
      } else {
        this.onError(chunk);
      }
    });
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

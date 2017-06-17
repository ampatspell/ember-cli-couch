import Ember from 'ember';
import Feed from './feed';
import Error from '../../../util/error';

const {
  run: { later, cancel }
} = Ember;

export default class EventSourceFeed extends Feed {

  static isSupported() {
    return typeof(EventSource) !== "undefined";
  }

  constructor(opts) {
    super(opts);
    this.source = null;
    this.bound = {
      open: this.onOpen.bind(this),
      error: this.onError.bind(this),
      message: this.onMessage.bind(this),
      heartbeat: this.onHeartbeat.bind(this)
    };
  }

  get qs() {
    return {
      feed: 'eventsource'
    };
  }

  start() {
    /* global EventSource */
    let source = new EventSource(this.url, { withCredentials: true });
    for(let key in this.bound) {
      source.addEventListener(key, this.bound[key], false);
    }
    this.source = source;
    super.start();
  }

  stop() {
    let source = this.source;
    source.close();
    for(let key in this.bound) {
      source.removeEventListener(key, this.bound[key], false);
    }
    this.source = null;
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
    }, this.opts.delay);
  }

  onOpen() {
  }

  onError(e) {
    let readyState = e.target.readyState;
    super.onError(new Error({ error: 'event source', reason: 'unknown', readyState }));
    if(readyState !== e.target.OPEN) {
      this.enqueueRestart();
    }
  }

  onHeartbeat() {
  }

  onMessage(message) {
    let data = message.data;
    let json = JSON.parse(data);
    this.onData(json);
  }

}

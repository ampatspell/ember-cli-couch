import Feed from './feed';
import Error from '../../../util/error';

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
    super.stop();
  }

  onOpen() {
  }

  onError(e) {
    var state = e.target.readyState;
    if(state === e.target.OPEN) {
      return;
    }
    super.onError(new Error({ error: 'unknown', reason: 'event source' }));
  }

  onHeartbeat() {
  }

  onMessage(message) {
    let data = message.data;
    let json = JSON.parse(data);
    this.onData(json);
  }

}

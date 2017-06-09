import Source from './source';
import Error from '../../../util/error';

export default class LongPollingSource extends Source {

  constructor(url) {
    super(url);
    this.source = null;
    this.bound = {
      open: this.onOpen.bind(this),
      error: this.onError.bind(this),
      message: this.onMessage.bind(this),
      heartbeat: this.onHeartbeat.bind(this)
    };
  }

  _start() {
    /* global EventSource */
    let source = new EventSource(this.url, { withCredentials: true });
    for(let key in this.bound) {
      source.addEventListener(key, this.bound[key], false);
    }
    this.source = source;
  }

  _stop() {
    let source = this.source;
    source.close();
    for(let key in this.bound) {
      source.removeEventListener(key, this.bound[key], false);
    }
    this.source = null;
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

/*

  let listener = new Listener(`${docs.get('url')}/_changes?feed=eventsource&include_docs=true&since=now`);
  listener.delegate = {
    onData(listener, data) {
      ...
    }
  }

  listener.start()

  ...

  listener.stop();

*/
export default class EventSourceListener {

  constructor(url) {
    this.url = url;
    this.started = false;
    this.open = false;
    this.source = null;
    this.delegate = null;
    this.bound = {
      open: this.onOpen.bind(this),
      error: this.onError.bind(this),
      message: this.onMessage.bind(this),
      heartbeat: this.onHeartbeat.bind(this)
    };
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

  start() {
    if(this.started) {
      return;
    }
    /* global EventSource */
    let source = new EventSource(this.url, { withCredentials: true });
    for(let key in this.bound) {
      source.addEventListener(key, this.bound[key], false);
    }
    this.source = source;
    this.started = true;
  }

  stop() {
    if(!this.started) {
      return;
    }
    let source = this.source;
    source.close();
    for(let key in this.bound) {
      source.removeEventListener(key, this.bound[key], false);
    }
    this.source = null;
    this.started = false;
    this.open = false;
  }

  onOpen() {
    this.open = true;
  }

  onError(e) {
    var state = e.target.readyState;
    if(state === e.target.OPEN) {
      return;
    }
    this.open = false;
  }

  onHeartbeat() {
  }

  onData(json) {
    this.notify('onData', json);
  }

  onMessage(message) {
    let data = message.data;
    let json = JSON.parse(data);
    this.onData(json);
  }

}

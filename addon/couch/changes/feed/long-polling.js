import Ember from 'ember';
import Feed from './feed';
import { request } from '../../request';

const {
  run: { next, later, cancel },
  RSVP: { resolve },
  merge
} = Ember;

export default class LongPollingFeed extends Feed {

  static isSupported() {
    return true;
  }

  get qs() {
    return {
      feed: 'longpoll'
    };
  }

  poll() {
    let url = this.url;
    request({ type: 'get', url, json: true }).then(data => {
      this.onMessage(data);
      this.nextPoll();
    }, err => {
      this.onError(err);
      this.nextPoll({ type: 'delayed' });
      return resolve();
    });
  }

  nextPoll(opts) {
    let { type } = merge({ type: 'immediate' }, opts);

    let invocation = () => {
      if(!this.started) {
        return;
      }
      this.poll();
    };

    cancel(this._poll);

    let cancelable;
    if(type === 'immediate') {
      cancelable = next(invocation);
    } else if(type === 'delayed') {
      cancelable = later(invocation, this.opts.reconnect);
    }

    this._poll = cancelable;
  }

  start() {
    this.poll();
    super.start();
  }

  onMessage(message) {
    this.onData(message);
  }

}

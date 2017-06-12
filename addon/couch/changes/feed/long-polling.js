import Ember from 'ember';
import Feed from './feed';
import { request } from '../../request';

const {
  run: { next, cancel },
  RSVP: { resolve }
} = Ember;

export default class LongPollingFeed extends Feed {

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
      return resolve();
    });
  }

  nextPoll() {
    cancel(this._poll);
    this._poll = next(() => {
      if(!this.started) {
        return;
      }
      this.poll();
    });
  }

  start() {
    this.poll();
    super.start();
  }

  onMessage(message) {
    this.onData(message);
  }

}

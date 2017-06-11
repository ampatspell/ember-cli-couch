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
    this.onOpen();

    let url = this.url;

    request({ type: 'get', url, json: true }).then(data => {
      if(this.started) {
        this.onMessage(data);
        this.onClosed();
        this.nextPoll();
      }
    }, err => {
      if(this.started) {
        this.onClosed();
        this.onError(err);
      }
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

  _start() {
    this.poll();
  }

  onMessage(message) {
    this.onData(message);
  }

}

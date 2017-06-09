import Ember from 'ember';
import Listener from './listener';
import { request } from '../../request';

const {
  A,
  run: { next, cancel },
  RSVP: { resolve }
} = Ember;

export default class LongPollingListener extends Listener {

  constructor(url) {
    super(url);
    this.source = null;
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

  onError(e) {
    // if(err.status === 404 && err.error === 'not_found' && err.reason === 'no_db_file') {
    //   return;
    // }
    super.onError(e);
  }

  onMessage(message) {
    let { results /* last_seq */ } = message;
    A(results).forEach(result => {
      this.onData(result);
    });
  }

}

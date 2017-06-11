import Ember from 'ember';
import Feed from '../../changes/feed/long-polling';
import qs from './qs';

const {
  A
} = Ember;

export default class DatabaseLongPollingFeed extends qs(Feed) {

  onData(data) {
    this.since = data.last_seq;
    A(data.results).forEach(result => super.onData(result.doc));
  }

}

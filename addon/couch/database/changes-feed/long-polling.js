import Ember from 'ember';
import Feed from '../../changes/feed/long-polling';
import withSince from './mixins/with-since';

const {
  A
} = Ember;

export default class DatabaseLongPollingFeed extends withSince(Feed) {

  onData(data) {
    this.since = data.last_seq;
    A(data.results).forEach(result => super.onData(result));
  }

}

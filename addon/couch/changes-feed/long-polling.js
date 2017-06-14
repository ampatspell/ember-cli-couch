import Ember from 'ember';
import Feed from '../changes/feed/long-polling';
import withSince from '../changes/feed/mixins/with-since';

const {
  A
} = Ember;

export default class CouchLongPollingFeed extends withSince(Feed) {

  onData(data) {
    this.since = data.last_seq;
    A(data.results).forEach(result => super.onData(result));
  }

}

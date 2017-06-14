import Ember from 'ember';
import Feed from './base-long-polling';
import withSince from './mixins/with-since';

const {
  A
} = Ember;

export default class LongPollingFeed extends withSince(Feed) {

  onData(data) {
    this.since = data.last_seq;
    A(data.results).forEach(result => super.onData(result));
  }

}

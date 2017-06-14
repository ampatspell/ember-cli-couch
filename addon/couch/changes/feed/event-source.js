import Feed from './base-event-source';
import withSince from './mixins/with-since';

export default class EventSourceFeed extends withSince(Feed) {

  onData(data) {
    this.since = data.seq;
    super.onData(data);
  }

}

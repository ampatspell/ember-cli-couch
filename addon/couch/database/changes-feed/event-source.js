import Feed from '../../changes/feed/event-source';
import withSince from '../../changes/feed/mixins/with-since';

export default class DatabaseEventSourceFeed extends withSince(Feed) {

  onData(data) {
    this.since = data.seq;
    super.onData(data);
  }

}

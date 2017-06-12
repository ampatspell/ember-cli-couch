import Feed from '../../changes/feed/event-source';
import qs from './qs';

export default class DatabaseEventSourceFeed extends qs(Feed) {

  onData(data) {
    this.since = data.seq;
    super.onData(data);
  }

}

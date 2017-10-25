import Feed from '../event-source';
import withSince from './mixins/with-since';

export default class ContinuousFeed extends withSince(Feed) {

  onData(data) {
    this.since = data.seq;
    super.onData(data);
  }

}

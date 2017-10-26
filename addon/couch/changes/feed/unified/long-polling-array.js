import Feed from '../long-polling';
import withSince from './mixins/with-since';
import array from './mixins/array';

export default class LongPollingArrayFeed extends array(withSince(Feed)) {

  onData(json) {
    this.onDataArray(json);
  }

}

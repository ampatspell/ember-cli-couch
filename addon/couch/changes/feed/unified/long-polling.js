import Feed from '../long-polling';
import withSince from './mixins/with-since';
import single from './mixins/single';
import array from './mixins/array';

export default class LongPollingArrayFeed extends array(single(withSince(Feed))) {

  onData(json) {
    if(json.results) {
      this.onDataArray(json);
    } else {
      this.onDataSingle(json);
    }
  }

}

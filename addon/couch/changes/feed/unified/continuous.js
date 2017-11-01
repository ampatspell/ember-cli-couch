import Feed from '../continuous';
import withSinceSingle from './mixins/with-since-single';

export default class ContinuousFeed extends withSinceSingle(Feed) {

  onData(json) {
    if(json.last_seq) {
      this.onSince(json.last_seq);
    } else {
      super.onData(json);
    }
  }

}

import Feed from '../event-source';
import withSinceSingle from './mixins/with-since-single';

export default class EventSourceFeed extends withSinceSingle(Feed) {
}

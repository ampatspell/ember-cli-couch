import withSince from './with-since';
import single from './single';

export default Class => class extends single(withSince(Class)) {

  onData(json) {
    this.onDataSingle(json);
  }

}

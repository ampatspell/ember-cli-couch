import { A } from '@ember/array';

export default Class => class extends Class {

  onDataArray(data) {
    this.onSince(data.last_seq);
    A(data.results).forEach(result => super.onData(result));
  }

}

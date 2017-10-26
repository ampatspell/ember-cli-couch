import Ember from 'ember';

const {
  A
} = Ember;

export default Class => class extends Class {

  onDataArray(data) {
    this.since = data.last_seq;
    A(data.results).forEach(result => super.onData(result));
  }

}

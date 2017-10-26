export default Class => class extends Class {

  onDataSingle(data) {
    this.since = data.seq;
    super.onData(data);
  }

}

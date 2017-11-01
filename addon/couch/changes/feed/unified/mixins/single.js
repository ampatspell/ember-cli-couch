export default Class => class extends Class {

  onDataSingle(data) {
    this.onSince(data.seq);
    super.onData(data);
  }

}

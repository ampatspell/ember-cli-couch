import Ember from 'ember';
import blobutil from '../blob-util';
import Error from '../error';
import lookupContentType from './content-type';

const {
  RSVP: { reject }
} = Ember;

export default class FileLoader {

  constructor(file) {
    this.file = file;
    this.promises = {};
    this.contentType = lookupContentType(file);
    this.size = file.size;
  }

  _cached(name, cb) {
    let promise = this.promises[name];
    if(!promise) {
      promise = cb();
      this.promises[name] = promise;
    }
    return promise;
  }

  toBase64String() {
    return this._cached('base64String', () => {
      return blobutil.blobToBase64String(this.file).catch(err => {
        if(err.name === 'TypeError') {
          return reject(new Error({ error: 'file_load', reason: 'Invalid file' }));
        }
        return reject(new Error({ error: 'file_load', reason: 'File too large' }));
      });
    });
  }

}

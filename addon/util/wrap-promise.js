import { reject, resolve } from 'rsvp';

export default promise => {
  return resolve(promise).then(res => resolve(res), err => reject(err));
}

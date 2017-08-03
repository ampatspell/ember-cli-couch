import Ember from 'ember';

const {
  RSVP: { resolve, reject }
} = Ember;

export default promise => {
  return resolve(promise).then(res => resolve(res), err => reject(err));
}

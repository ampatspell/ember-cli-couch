import Ember from 'ember';

const {
  RSVP: { Promise, resolve },
  run
} = Ember;

export const wait = (arg, delay) => new Promise(resolve => run.later(() => resolve(arg), delay));
